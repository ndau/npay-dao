import { BrowserRouter } from "react-router-dom";
import Header from "./Layouts/Header/Header";
import Footer from "./Layouts/Footer/Footer";
import AllRoutes from "./routes/routes";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./App.css";

function App() {
  return (
    <>
      <BrowserRouter>
        <ToastContainer />
        <Header />
        <AllRoutes />
        <Footer />
      </BrowserRouter>
    </>
  );
}

export default App;
