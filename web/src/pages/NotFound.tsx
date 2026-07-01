import { Link } from "react-router-dom";
import { Compass } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <Compass className="h-10 w-10 text-muted-foreground" />
      <h1 className="mt-4 font-serif text-3xl font-bold">Lost the thread</h1>
      <p className="mt-2 text-muted-foreground">That page isn't here. Let's get you back to the work.</p>
      <Link to="/" className="mt-6"><Button variant="brand">Back to the dashboard</Button></Link>
    </div>
  );
}
