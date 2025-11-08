import Sidebar from "./components/sidebar";

export default function AmenitiesManagementScreen() {
  return (
    <main className="grid grid-cols-[0.2fr_1fr]">
      <Sidebar />
      <div className="flex flex-col gap-6 p-12">
        <h1 className="lg:text-4xl font-bold">Amenities</h1>
      </div>
    </main>
  );
}
