import { Link } from "react-router-dom";
import { SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center px-4">
        <SearchX className="h-24 w-24 text-muted-foreground mx-auto mb-6" />
        <h1 className="mb-4 text-6xl font-bold gradient-text">404</h1>
        <p className="mb-2 text-2xl font-semibold">Page Not Found</p>
        <p className="mb-8 text-muted-foreground max-w-md mx-auto">
          Looks like this page doesn't exist in the Comrade Circle. Let's get you back home.
        </p>
        <Button variant="gradient" size="lg" asChild>
          <Link to="/">Return Home</Link>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
