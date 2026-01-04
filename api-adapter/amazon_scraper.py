"""
Amazon order history scraper using Playwright browser automation.

This scraper logs into Amazon and extracts real order data from your account.
Requires AMAZON_EMAIL and AMAZON_PASSWORD environment variables.
"""
import os
import asyncio
from typing import List, Dict, Optional
from datetime import datetime
import logging
from pathlib import Path

try:
    from playwright.async_api import async_playwright, Browser, Page
    HAS_PLAYWRIGHT = True
except ImportError:
    HAS_PLAYWRIGHT = False

logger = logging.getLogger("amazon-scraper")


class AmazonScraper:
    """Scrapes Amazon order history using browser automation."""
    
    def __init__(self, email: str, password: str, headless: bool = True):
        self.email = email
        self.password = password
        self.headless = headless
        self.browser: Optional[Browser] = None
        self.context = None
        self.page: Optional[Page] = None
        
    async def __aenter__(self):
        """Context manager entry - launches browser."""
        if not HAS_PLAYWRIGHT:
            raise ImportError("playwright not installed. Run: pip install playwright && playwright install")
        
        playwright = await async_playwright().start()
        # Create persistent context to save cookies
        user_data_dir = Path.home() / ".aura" / "amazon-session"
        user_data_dir.mkdir(parents=True, exist_ok=True)

        # launch_persistent_context manages browser+context together
        self.context = await playwright.chromium.launch_persistent_context(
            user_data_dir=str(user_data_dir),
            headless=self.headless,
            viewport={"width": 1280, "height": 720},
        )
        self.browser = self.context.browser
        self.page = await self.context.new_page()
        return self
        
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        """Context manager exit - closes browser."""
        if self.context:
            await self.context.close()
        if self.browser:
            await self.browser.close()
            
    async def login(self) -> bool:
        """Log into Amazon account."""
        try:
            logger.info(f"Logging in as {self.email}...")
            
            # Go directly to orders page
            orders_url = "https://www.amazon.com/gp/your-account/order-history"
            logger.info(f"Navigating to {orders_url}")
            
            try:
                await self.page.goto(orders_url, wait_until="domcontentloaded", timeout=30000)
            except Exception as nav_error:
                logger.warning(f"Navigation timeout, trying signin directly: {nav_error}")
                await self.page.goto("https://www.amazon.com/ap/signin", wait_until="domcontentloaded", timeout=30000)
            
            # Give page time to load
            await asyncio.sleep(2)
            
            # Check if we're already logged in
            try:
                page_content = await self.page.content()
                if "Your Orders" in page_content or "order-history" in self.page.url:
                    logger.info("Already logged in!")
                    return True
            except:
                pass
            
            # Try to find and fill email field
            logger.info("Looking for email field...")
            email_field = None
            email_selectors = ["#ap_email", "input[name='email']", "input[type='email']", "input[autocomplete='username']"]
            
            for selector in email_selectors:
                try:
                    field = await self.page.query_selector(selector)
                    if field:
                        email_field = field
                        logger.info(f"Found email field with selector: {selector}")
                        await field.fill(self.email)
                        await asyncio.sleep(1)
                        break
                except Exception as e:
                    logger.debug(f"Email selector {selector} failed: {e}")
                    continue
            
            if not email_field:
                logger.error("Could not find email field on login page")
                await self.page.screenshot(path="/tmp/amazon-email-field.png")
                return False
            
            # Click continue button
            try:
                continue_btn = await self.page.query_selector("input[type='submit']")
                if continue_btn:
                    await continue_btn.click()
                    await asyncio.sleep(2)
            except Exception as e:
                logger.warning(f"Could not click continue button: {e}")
            
            # Try to find and fill password field
            logger.info("Looking for password field...")
            password_field = None
            password_selectors = ["#ap_password", "input[name='password']", "input[type='password']", "input[autocomplete='current-password']"]
            
            for selector in password_selectors:
                try:
                    field = await self.page.query_selector(selector)
                    if field:
                        password_field = field
                        logger.info(f"Found password field with selector: {selector}")
                        await field.fill(self.password)
                        await asyncio.sleep(1)
                        break
                except Exception as e:
                    logger.debug(f"Password selector {selector} failed: {e}")
                    continue
            
            if not password_field:
                logger.warning("Could not find password field, but continuing anyway")
            
            # Click sign in button
            try:
                signin_btn = await self.page.query_selector("input[type='submit']")
                if signin_btn:
                    await signin_btn.click()
                    await asyncio.sleep(3)
            except Exception as e:
                logger.warning(f"Could not click sign in button: {e}")
            
            # Wait for redirect to orders page
            try:
                await self.page.wait_for_url("**/gp/your-account/**", timeout=15000)
                logger.info("Successfully navigated to account page!")
                return True
            except:
                logger.warning("Did not see account page redirect, checking content anyway...")
            
            # Check final page
            try:
                page_content = await self.page.content()
                if "Your Orders" in page_content or "order" in page_content.lower():
                    logger.info("Login appears successful based on page content")
                    return True
            except:
                pass
            
            logger.error("Login verification failed")
            await self.page.screenshot(path="/tmp/amazon-login-fail.png")
            return False
                
        except Exception as e:
            logger.error(f"Login error: {e}")
            import traceback
            logger.error(traceback.format_exc())
            return False
            
    async def scrape_orders(self, max_orders: int = 50) -> List[Dict]:
        """Scrape order history from Amazon."""
        orders = []
        
        try:
            logger.info("Navigating to order history...")
            await self.page.goto("https://www.amazon.com/gp/your-account/order-history")
            # Amazon DOM varies; give page time to render instead of failing fast
            await self.page.wait_for_load_state("networkidle")
            await self.page.wait_for_timeout(5000)
            
            pages_scraped = 0
            max_pages = 5  # Limit pagination
            
            while len(orders) < max_orders and pages_scraped < max_pages:
                # Extract orders from current page using multiple selectors
                order_cards = await self.page.query_selector_all(
                    "div.a-box.group.order, .order-card, [data-order-id], div.order" 
                )
                
                for card in order_cards:
                    if len(orders) >= max_orders:
                        break
                        
                    try:
                        # Extract order ID (attribute first, then text)
                        order_id = await card.get_attribute("data-order-id") or ""
                        if not order_id:
                            order_id_elem = await card.query_selector("span:has-text('Order #')")
                            order_id_text = await order_id_elem.inner_text() if order_id_elem else "unknown"
                            order_id = order_id_text.replace("Order #", "").strip()

                        # Extract order date using multiple selectors
                        date_selectors = [
                            "span.order-date-invoice-item",
                            ".order-info .a-color-secondary",
                            "span:has-text('Ordered on')",
                        ]
                        date_str = ""
                        for sel in date_selectors:
                            try:
                                elem = await card.query_selector(sel)
                                if elem:
                                    date_str = (await elem.inner_text()) or ""
                                    break
                            except Exception:
                                continue
                        
                        # Extract items
                        item_elems = await card.query_selector_all(
                            ".shipment .a-link-normal, a[href*='/dp/'], a[href*='/gp/product']"
                        )
                        
                        for item_elem in item_elems:
                            try:
                                name = await item_elem.get_attribute("title") or await item_elem.inner_text()
                                url = await item_elem.get_attribute("href")
                                
                                # Extract ASIN from URL
                                asin = ""
                                if url and "/dp/" in url:
                                    asin = url.split("/dp/")[1].split("/")[0]
                                
                                # Extract image (prefer within the card)
                                img_elem = await item_elem.query_selector("img") or await card.query_selector("img")
                                image_url = await img_elem.get_attribute("src") if img_elem else None
                                
                                # Extract price (if available) from common selectors
                                price_selectors = [
                                    ".a-color-price",
                                    ".a-row .a-color-secondary .value",
                                    "span:has-text('$')",
                                ]
                                price = None
                                for psel in price_selectors:
                                    try:
                                        pelem = await card.query_selector(psel)
                                        if pelem:
                                            price_str = await pelem.inner_text()
                                            if price_str:
                                                price = float(
                                                    price_str.replace("$", "").replace(",", "")
                                                )
                                                break
                                    except Exception:
                                        continue
                                
                                orders.append({
                                    "order_id": order_id,
                                    "order_date": date_str,
                                    "asin": asin,
                                    "name": name.strip(),
                                    "price": price,
                                    "image_url": image_url,
                                    "url": f"https://www.amazon.com{url}" if url and url.startswith("/") else url,
                                })
                                
                            except Exception as e:
                                logger.warning(f"Failed to parse item: {e}")
                                continue
                                
                    except Exception as e:
                        logger.warning(f"Failed to parse order card: {e}")
                        continue
                
                # Check for next page
                pages_scraped += 1
                next_button = await self.page.query_selector(".pagination-next:not(.disabled)")
                if next_button and pages_scraped < max_pages:
                    await next_button.click()
                    await self.page.wait_for_load_state("networkidle")
                else:
                    break
                    
            logger.info(f"Scraped {len(orders)} orders from {pages_scraped} pages")
            if not orders:
                # Dump page content for debugging
                try:
                    html_path = "/tmp/amazon-order-page.html"
                    await self.page.wait_for_timeout(2000)
                    content = await self.page.content()
                    with open(html_path, "w", encoding="utf-8") as f:
                        f.write(content)
                    logger.warning(f"No orders parsed; saved page HTML to {html_path}")
                except Exception as dump_err:
                    logger.warning(f"Failed to dump order page HTML: {dump_err}")
            return orders
            
        except Exception as e:
            logger.error(f"Scraping error: {e}")
            return orders


async def scrape_amazon_orders(email: str, password: str, max_orders: int = 50) -> List[Dict]:
    """
    Main function to scrape Amazon orders.
    
    Args:
        email: Amazon account email
        password: Amazon account password
        max_orders: Maximum orders to fetch
        
    Returns:
        List of order dictionaries
    """
    if not HAS_PLAYWRIGHT:
        raise ImportError("playwright not installed")
    
    async with AmazonScraper(email, password) as scraper:
        if await scraper.login():
            return await scraper.scrape_orders(max_orders)
        else:
            raise Exception("Failed to log into Amazon")


if __name__ == "__main__":
    # Test the scraper
    from dotenv import load_dotenv
    load_dotenv()
    
    email = os.getenv("AMAZON_EMAIL")
    password = os.getenv("AMAZON_PASSWORD")
    
    if not email or not password:
        print("Error: Set AMAZON_EMAIL and AMAZON_PASSWORD in .env file")
        exit(1)
    
    print("Starting Amazon scraper...")
    orders = asyncio.run(scrape_amazon_orders(email, password, max_orders=10))
    
    print(f"\nFound {len(orders)} orders:")
    for order in orders[:5]:  # Show first 5
        print(f"  - {order['name']} (${order.get('price', 'N/A')})")
