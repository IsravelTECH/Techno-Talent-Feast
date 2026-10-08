import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import {
  FolderKanban,
  Trophy,
  Search,
  Filter,
  ArrowRight,
  Code,
  Cpu,
  Boxes,
  Sparkles,
  ExternalLink,
  BookOpen,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { CompetitionProject } from '../types';

export const ProjectsPage: React.FC = () => {
  const { competitions, projects = [], navigate, setSelectedProject, addToast } = useApp();
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeProjectModal, setActiveProjectModal] = useState<CompetitionProject | null>(null);

  const safeProjects: CompetitionProject[] = projects.length > 0 
    ? projects 
    : competitions.flatMap(c => c.projects || []);

  const filteredProjects = safeProjects.filter((p) => {
    const comp = competitions.find(c => c.categoryNumber === p.categoryNumber || c.id === `cat-${p.categoryNumber}`);
    const matchesCategory = selectedCategoryFilter === 'ALL' || 
      (comp && comp.id === selectedCategoryFilter) || 
      String(p.categoryNumber) === selectedCategoryFilter;
    
    const tools = p.softwareOrTools || [];
    const code = `P${p.categoryNumber}-0${p.projectNumber}`;
    const matchesSearch =
      (p.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.categoryName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      tools.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-card">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl lg:text-2xl font-black text-slate-900 tracking-tight">
              24 Championship Projects Repository
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-[#EAF3FF] text-[#0057B8] text-xs font-bold">
              4 Projects / Category
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Official specifications, permissible hardware/software tools, problem statements, and evaluation criteria
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="orange"
            size="sm"
            icon={<Sparkles className="w-4 h-4" />}
            onClick={() => navigate('scoring')}
          >
            Open Evaluation Desk
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search project code, title, tool (e.g. Python, Arduino)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-[#F6F9FD] border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-[#0057B8]"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
          <select
            value={selectedCategoryFilter}
            onChange={(e) => setSelectedCategoryFilter(e.target.value)}
            className="px-3 py-2 bg-[#F6F9FD] border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#0057B8]"
          >
            <option value="ALL">All 6 Categories (24 Projects)</option>
            {competitions.map((comp) => (
              <option key={comp.id} value={comp.id}>
                Cat {comp.categoryNumber}: {comp.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredProjects.map((project) => {
          const comp = competitions.find(c => c.categoryNumber === project.categoryNumber);
          const tools = project.softwareOrTools || [];
          const projectCode = `P${project.categoryNumber}-0${project.projectNumber}`;

          return (
            <div
              key={project.id}
              className="bg-white rounded-3xl border border-slate-200/80 shadow-card hover:shadow-card-hover transition-all flex flex-col justify-between p-5 group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-xl bg-blue-50 text-[#0057B8] font-black font-mono text-xs border border-blue-100">
                    {projectCode}
                  </span>
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    {project.categoryName || comp?.name}
                  </span>
                </div>

                <div>
                  <h3 className="text-sm font-black text-slate-900 group-hover:text-[#0057B8] transition-colors line-clamp-1">
                    {project.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                    {project.objective || project.specification}
                  </p>
                </div>

                {/* Permissible Tools */}
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                    Permitted Tools & Software
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {tools.slice(0, 3).map((tool, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700 text-[10px] font-semibold"
                      >
                        {tool}
                      </span>
                    ))}
                    {tools.length > 3 && (
                      <span className="px-2 py-0.5 rounded-lg bg-slate-100 text-slate-500 text-[10px] font-semibold">
                        +{tools.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-500 font-medium">
                  Grade Band: <strong>{project.gradeEligibility || comp?.gradeEligibility || 'Grades 6-12'}</strong>
                </span>
                <Button
                  variant="primary"
                  size="xs"
                  icon={<BookOpen className="w-3.5 h-3.5" />}
                  onClick={() => setActiveProjectModal(project)}
                >
                  View Spec
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Project Specification Modal */}
      {activeProjectModal && (
        <Modal
          isOpen={!!activeProjectModal}
          onClose={() => setActiveProjectModal(null)}
          title={`Project Spec: P${activeProjectModal.categoryNumber}-0${activeProjectModal.projectNumber} — ${activeProjectModal.title}`}
          subtitle={`${activeProjectModal.categoryName} • Official TTF 2026 Problem Statement`}
          footer={
            <div className="flex items-center justify-end gap-3">
              <Button variant="secondary" onClick={() => setActiveProjectModal(null)}>
                Close
              </Button>
              <Button
                variant="orange"
                icon={<ArrowRight className="w-4 h-4" />}
                onClick={() => {
                  setActiveProjectModal(null);
                  navigate('scoring');
                }}
              >
                Score this Project
              </Button>
            </div>
          }
        >
          <div className="space-y-4 text-xs">
            <div>
              <strong className="text-slate-900 block font-bold mb-1">Objective & Problem Statement:</strong>
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-slate-700 leading-relaxed">
                {activeProjectModal.objective || activeProjectModal.specification}
              </div>
            </div>

            {activeProjectModal.tasks && activeProjectModal.tasks.length > 0 && (
              <div>
                <strong className="text-slate-900 block font-bold mb-1">Core Deliverables & Tasks:</strong>
                <ul className="list-disc list-inside space-y-1 p-3.5 rounded-2xl bg-blue-50/50 border border-blue-100 text-slate-700">
                  {activeProjectModal.tasks.map((tsk, idx) => (
                    <li key={idx}><strong>{tsk}</strong></li>
                  ))}
                </ul>
              </div>
            )}

            <div>
              <strong className="text-slate-900 block font-bold mb-1">Permissible Hardware & Software:</strong>
              <div className="flex flex-wrap gap-2 pt-1">
                {(activeProjectModal.softwareOrTools || []).map((t, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-xl bg-[#EAF3FF] text-[#0057B8] border border-blue-200 font-mono font-bold text-[11px]"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
