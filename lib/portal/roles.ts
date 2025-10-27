import { getFunctions, httpsCallable } from "firebase/functions";
import { app } from "@/lib/firebase/client";

export async function setUserRole(uid: string, role: "manager"|"superadmin") {
  const fn = httpsCallable(getFunctions(app, "us-west1"), "setUserRole");
  await fn({ uid, role });
}
