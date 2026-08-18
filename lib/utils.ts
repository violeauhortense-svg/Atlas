export const getPhaseProgress = (status: string): number => {
  const phases: { [key: string]: number } = {
    phase_1_validation: 20,
    phase_2_architecture: 40,
    phase_3_development: 60,
    phase_4_launch: 80,
    phase_5_post_launch: 100,
    killed: 0,
  };
  return phases[status] || 0;
};

export const getStatusBadge = (status: string): { text: string; color: string } => {
  const badges: { [key: string]: { text: string; color: string } } = {
    phase_1_validation: { text: "📊 Market Validation", color: "primary" },
    phase_2_architecture: { text: "🏗️ Architecture", color: "primary" },
    phase_3_development: { text: "💻 Development", color: "primary" },
    phase_4_launch: { text: "🚀 Launch Ready", color: "success" },
    phase_5_post_launch: { text: "📈 Growth", color: "success" },
    killed: { text: "❌ Killed", color: "warning" },
  };
  return badges[status] || { text: "Unknown", color: "primary" };
};

export const formatDate = (date: string): string => {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export const getPhaseLabel = (status: string): string => {
  const labels: { [key: string]: string } = {
    phase_1_validation: "Phase 1: Market Validation",
    phase_2_architecture: "Phase 2: Architecture & Design",
    phase_3_development: "Phase 3: Development",
    phase_4_launch: "Phase 4: Launch",
    phase_5_post_launch: "Phase 5: Growth",
  };
  return labels[status] || "Unknown Phase";
};

export const getAgentsForPhase = (status: string): Array<{ name: string; task: string }> => {
  const agents: { [key: string]: Array<{ name: string; task: string }> } = {
    validation: [
      { name: "Market Researcher", task: "Valide la demande du marché" },
      { name: "Competitive Analyst", task: "Analyse les concurrents" },
      { name: "Customer Interviewer", task: "Conduit les entretiens clients" },
    ],
    phase_1_validation: [
      { name: "Market Researcher", task: "Valide la demande du marché" },
      { name: "Competitive Analyst", task: "Analyse les concurrents" },
      { name: "Customer Interviewer", task: "Conduit les entretiens clients" },
    ],
    phase_2_architecture: [
      { name: "Product Architect", task: "Dessine l'architecture produit" },
      { name: "UX Designer", task: "Crée les wireframes et flows" },
      { name: "Tech Lead", task: "Planifie la stack technique" },
    ],
    phase_3_development: [
      { name: "Backend Engineer", task: "Développe l'API et la DB" },
      { name: "Frontend Engineer", task: "Crée l'interface utilisateur" },
      { name: "DevOps Engineer", task: "Configure l'infrastructure" },
      { name: "QA Engineer", task: "Teste la qualité du produit" },
    ],
    phase_4_launch: [
      { name: "Launch Manager", task: "Orchestre le lancement" },
      { name: "Marketing Lead", task: "Prépare la campagne de lancement" },
      { name: "Community Manager", task: "Engage la communauté" },
    ],
    phase_5_post_launch: [
      { name: "Growth Hacker", task: "Optimise la croissance" },
      { name: "Data Analyst", task: "Analyse les métriques clés" },
      { name: "Product Manager", task: "Piloter les améliorations" },
    ],
  };
  return agents[status] || [];
};
