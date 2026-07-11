import { supabaseAdmin } from "@/lib/supabaseServer";
import ProjectsManager from "./ProjectsManager";

export const dynamic = "force-dynamic";

export default async function ProjectsPage() {
  const { data: projects } = await supabaseAdmin
    .from("projects")
    .select("id, code, name, domain, abbr, language, country, created_at")
    .order("created_at", { ascending: false });

  return (
    <>
      <h1>Projetos</h1>
      <p className="muted">
        Cadastre cada projeto uma vez (domínio, abreviação, idioma, país). Ao
        criar um split, você só escolhe o projeto e o sistema gera as UTMs
        sozinho — buscando o Post ID no WordPress.
      </p>
      <ProjectsManager initial={projects ?? []} />
    </>
  );
}
