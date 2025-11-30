import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Pages from "./pages/Pages"; // ← MUDEI SÓ ISSO!

// Create a client
const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Pages />
    </QueryClientProvider>
  );
}

export default App;