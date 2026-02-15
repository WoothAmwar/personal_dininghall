import DescribeMeal from "@/components/DescribeMeal";

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 p-8">
      <main className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

          {/* Breakfast Column */}
          <div className="space-y-4">
            <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-600 top-0 bg-zinc-50 dark:bg-zinc-950 py-4 z-10 border-b-2 border-orange-100 dark:border-zinc-800">
              BREAKFAST
            </h1>
            <DescribeMeal meal_time={"breakfast"} />
          </div>

          {/* Lunch Column */}
          <div className="space-y-4">
            <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-600 top-0 bg-zinc-50 dark:bg-zinc-950 py-4 z-10 border-b-2 border-green-100 dark:border-zinc-800">
              LUNCH
            </h1>
            <DescribeMeal meal_time={"lunch"} />
          </div>

          {/* Dinner Column */}
          <div className="space-y-4">
            <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-600 top-0 bg-zinc-50 dark:bg-zinc-950 py-4 z-10 border-b-2 border-blue-100 dark:border-zinc-800">
              DINNER
            </h1>
            <DescribeMeal meal_time={"dinner"} />
          </div>

        </div>
      </main>
    </div>
  );
}
