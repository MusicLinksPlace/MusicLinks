
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import SignUp from "./pages/SignUp";
import Login from "./pages/Login";
import Providers from "./pages/Providers";
import Projects from "./pages/Projects";
import HowItWorks from "./pages/HowItWorks";
import Legal from "./pages/Legal";
import ArtistSetup from "./pages/ArtistSetup";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/login" element={<Login />} />
          <Route path="/providers" element={<Providers />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/how-it-works" element={<HowItWorks />} />
          <Route path="/legal" element={<Legal />} />
          <Route path="/profile/artist-setup" element={<ArtistSetup />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
