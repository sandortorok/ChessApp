export default function TailwindColumns() {
  return (
    <div className="flex flex-col md:flex-row md:h-screen">
      {/* Első oszlop - 3 dolog */}
      <div className="flex flex-col flex-1 bg-blue-500 p-4">
        <div className="h-[50px] bg-white rounded-lg p-4 mb-4 flex items-center justify-center">
          <p className="text-xl font-semibold">Első elem</p>
        </div>
        <div className="flex-1 bg-white rounded-lg p-4 mb-4 flex items-center justify-center">
          <p className="text-xl font-semibold">Második elem</p>
        </div>
        <div className="h-[50px] bg-white rounded-lg p-4 flex items-center justify-center">
          <p className="text-xl font-semibold">Harmadik elem</p>
        </div>
      </div>

      {/* Második oszlop - 2 dolog */}
      <div className="flex flex-col flex-1 bg-green-500 p-4">
        <div className="flex-1 bg-white rounded-lg p-4 mb-4 flex items-center justify-center">
          <p className="text-xl font-semibold">Első elem</p>
        </div>
        <div className="flex-1 bg-white rounded-lg p-4 flex items-center justify-center">
          <p className="text-xl font-semibold">Második elem</p>
        </div>
      </div>
    </div>
  );
}