import { useEffect, useState } from "react";
import { getRegisteredVehicles } from "../../api/citizen";
import { Car, Bike, Truck, Hash } from "lucide-react";

const getVehicleIcon = (model = "") => {
    const m = model.toLowerCase();
    if (m.includes("bike") || m.includes("scooter") || m.includes("motorcycle")) return Bike;
    if (m.includes("truck") || m.includes("bus") || m.includes("van")) return Truck;
    return Car;
};

const Vehicles = () => {
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchVehicles = async () => {
            setLoading(true);
            try {
                const res = await getRegisteredVehicles();
                setVehicles(res.data.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchVehicles();
    }, []);

    return (
        <div className="max-w-4xl mx-auto px-4 py-8 md:px-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-white tracking-tight">My Vehicles</h1>
                <p className="text-slate-400 text-sm mt-1">
                    {vehicles.length} registered vehicle{vehicles.length !== 1 ? "s" : ""}
                </p>
            </div>

            {/* Loading */}
            {loading && (
                <div className="flex justify-center py-16">
                    <div className="w-8 h-8 rounded-full border-2 border-sky-500 border-t-transparent animate-spin" />
                </div>
            )}

            {/* Empty State */}
            {!loading && vehicles.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-600">
                        <Car size={28} />
                    </div>
                    <div>
                        <p className="text-white font-medium">No vehicles registered</p>
                        <p className="text-slate-500 text-sm mt-1">Your registered vehicles will appear here</p>
                    </div>
                </div>
            )}

            {/* Vehicle Grid */}
            {!loading && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {vehicles.map((v) => {
                        const Icon = getVehicleIcon(v.model);
                        return (
                            <div
                                key={v.vehicle_id}
                                className="group bg-slate-800/50 border border-slate-700/60 rounded-2xl p-5 hover:border-sky-500/30 hover:bg-slate-800/70 transition-all duration-200 cursor-default"
                            >
                                {/* Icon */}
                                <div className="w-12 h-12 rounded-xl bg-slate-700/60 flex items-center justify-center text-slate-400 mb-4 group-hover:bg-sky-500/10 group-hover:text-sky-400 transition-all duration-200">
                                    <Icon size={22} />
                                </div>

                                {/* Vehicle Number Plate */}
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="font-mono text-lg font-bold text-white tracking-widest">
                                        {v.vehicle_number}
                                    </span>
                                </div>

                                {/* Model */}
                                <p className="text-slate-400 text-sm">{v.model}</p>

                                {/* Divider */}
                                <div className="mt-4 pt-4 border-t border-slate-700/50 flex items-center gap-1.5 text-xs text-slate-500">
                                    <Hash size={11} />
                                    ID: {v.vehicle_id}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default Vehicles;