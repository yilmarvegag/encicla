import { http, HttpResponse } from "msw";

export const handlers = [
  http.post("/api/registration/start", async () => {
    return HttpResponse.json({ registrationId: crypto.randomUUID() });
  }),
  http.post("/api/registration/verify-otp", async () => HttpResponse.json({})),
  http.post("/api/registration/:id/type", async () =>
    HttpResponse.json({ civicaValidated: true })
  ),
  http.post("/api/registration/:id/extra", async () =>
    HttpResponse.json({ status: "Pendiente de verificación" })
  ),
];
