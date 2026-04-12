import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "@/pages/Dashboard";
import NewDocumentation from "@/pages/NewDocumentation";
import EditDocumentation from "@/pages/EditDocumentation";
import History from "@/pages/History";
import Templates from "@/pages/Templates";
import { Toaster } from "@/components/ui/sonner";

function App() {
  return (
    <div className="App dark">
      <Toaster position="top-right" />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/new" element={<NewDocumentation />} />
          <Route path="/edit/:id" element={<EditDocumentation />} />
          <Route path="/history" element={<History />} />
          <Route path="/templates" element={<Templates />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;