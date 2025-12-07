import { FittingRoom } from "@/components/FittingRoom";

export default function FittingRoomPage() {
    return (
        <div className="h-screen pb-24 pt-4 px-4 flex flex-col">
            <h1 className="text-xl font-bold mb-4">Fitting Room</h1>
            <FittingRoom />
        </div>
    );
}
