import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Providers } from "@/app/providers";
import { AuthProvider } from "@/context/AuthContext";
import { AppRouter } from "@/app/router";
import { sendOtp } from "./api/client";

async function testApi() {
  try {
    const res = await sendOtp({
      full_name: "Test User",
      email: `test_${Date.now()}@example.com`,
      password: "password123",
      channel: "EMAIL",
    });
    console.log("sendOtp success:", res);
  } catch (err) {
    console.error("sendOtp error:", err);
  }
}

testApi();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <Providers>
        <AuthProvider>
          <AppRouter />
        </AuthProvider>
      </Providers>
    </BrowserRouter>
  </StrictMode>,
);
