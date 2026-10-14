import { redirect } from "next/navigation";
// This route immediately redirects; it has no independent instant shell.
export const instant = false;
export default function Entry() {
  redirect("/en");
}
