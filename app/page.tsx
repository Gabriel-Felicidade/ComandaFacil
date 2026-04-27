import { redirect } from "next/navigation";

export default function HomePage() {
  // Assim que alguém acessar o site principal, é jogado para o Login
  redirect("/login");
}