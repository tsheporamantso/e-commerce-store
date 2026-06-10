import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  return (
    <div>
      <h1 className="text-3xl">Home Page</h1>
      <Button
        variant={"destructive"}
        size={"lg"}
        className="m-8 capitalize"
        asChild
      >
        <Link href={"/about"}>about</Link>
      </Button>
    </div>
  );
}
