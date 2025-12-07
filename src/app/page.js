import DescribeMeal  from "@/components/DescribeMeal";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main>
        <h1 className="text-4xl">BREAKFAST</h1>
        <DescribeMeal meal_time={"breakfast"}/>

        <br />
        <h1 className="text-4xl">LUNCH</h1>
        <DescribeMeal meal_time={"lunch"}/>

        <br />
        <h1 className="text-4xl">DINNER</h1>
        <DescribeMeal meal_time={"dinner"}/>
      </main>
    </div>
  );
}
