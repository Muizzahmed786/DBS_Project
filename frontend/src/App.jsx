import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AppRoutes from "./routes/AppRoutes";
function App() {
    return (
        <BrowserRouter>
            <AppRoutes/>
        </BrowserRouter>
    )
}

export default App
