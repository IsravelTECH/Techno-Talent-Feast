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
  Clock,
  Users,
  Layers,
  Building2,
  LayoutGrid,
  List
} from 'lucide-react';
import { CompetitionProject } from '../types';
import { CATEGORY_CATALOG } from '../utils/projectCatalog';

export const ProjectsPage: React.FC = () => {
  const { competitions, projects = [], participants, navigate, setSelectedProject, addToast } = useApp();
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeProjectModal, setActiveProjectModal] = useState<CompetitionProject | null>(null);
  const [viewLayout, setViewLayout] = useState<'grid' | 'list'>('grid');

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-card">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-lg sm:text-xl lg:text-2xl font-black text-slate-900 tracking-tight">
              24 Official Championship Projects
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-[#E6F7F5] text-[#03A695] text-xs font-bold">
              4 Projects / Category
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Standardized project statements across Grades 1 to 12 • Every team chooses exactly 1 project in their category
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="orange"
            size="sm"
            icon={<Users className="w-4 h-4" />}
            onClick={() => navigate('participants')}
            className="text-xs"
          >
            Manage Team Projects
          </Button>
        </div>
      </div>

      {/* Category Grade Bands Grid Guide */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3">
        {CATEGORY_CATALOG.map((cat) => {
          const isSelected = selectedCategoryFilter === String(cat.categoryNumber) || selectedCategoryFilter === cat.id;

          return (
            <div
              key={cat.categoryNumber}
              onClick={() => setSelectedCategoryFilter(isSelected ? 'ALL' : String(cat.categoryNumber))}
              className={`p-3 sm:p-3.5 rounded-2xl border-2 transition-all cursor-pointer text-center ${
                isSelected
                  ? 'border-[#03A695] bg-[#E6F7F5] shadow-xs ring-2 ring-teal-500/20'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <span className="text-[10px] font-black uppercase text-[#03A695] block">
                Cat {cat.categoryNumber}
              </span>
              <h4 className="text-xs font-black text-slate-900 truncate mt-0.5">
                {cat.gradeEligibility}
              </h4>
              <span className="text-[10px] text-slate-400 font-semibold block mt-1">
                4 Projects (Choose 1)
              </span>
            </div>
          );
        })}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search project code, title, tools..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-[#F7FCFB] border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-[#03A695]"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
          <select
            value={selectedCategoryFilter}
            onChange={(e) => setSelectedCategoryFilter(e.target.value)}
            className="flex-1 sm:flex-none px-3 py-2 bg-[#F7FCFB] border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:border-[#03A695] truncate"
          >
            <option value="ALL">All 6 Categories (24 Projects)</option>
            {competitions.map((comp) => (
              <option key={comp.id} value={String(comp.categoryNumber)}>
                Category {comp.categoryNumber}: {comp.name} ({comp.gradeEligibility})
              </option>
            ))}
          </select>

          {/* Grid / List View Toggle */}
          <div className="flex items-center bg-[#F7FCFB] p-1 rounded-2xl border border-slate-200 shrink-0">
            <button
              onClick={() => setViewLayout('grid')}
              className={`p-1.5 sm:p-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center cursor-pointer ${
                viewLayout === 'grid'
                  ? 'bg-white text-[#0B2545] shadow-xs border border-slate-200/80 font-black'
                  : 'text-slate-400 hover:text-slate-700'
              }`}
              title="Grid View"
              aria-label="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewLayout('list')}
              className={`p-1.5 sm:p-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center cursor-pointer ${
                viewLayout === 'list'
                  ? 'bg-white text-[#0B2545] shadow-xs border border-slate-200/80 font-black'
                  : 'text-slate-400 hover:text-slate-700'
              }`}
              title="List View"
              aria-label="List View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Projects Presentation: Grid or List */}
      {viewLayout === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProjects.map((project) => {
            const comp = competitions.find(c => c.categoryNumber === project.categoryNumber);
            const tools = project.softwareOrTools || [];
            const projectCode = `P${project.categoryNumber}-0${project.projectNumber}`;

            // Count teams enrolled in this specific project
            const enrolledCount = participants.filter(
              (p) =>
                (p.categoryNumber === project.categoryNumber && p.projectNumber === project.projectNumber) ||
                p.projectId === project.id ||
                p.projectTitle?.toLowerCase() === project.title?.toLowerCase()
            ).length;

            return (
              <div
                key={project.id}
                className="bg-white rounded-3xl border border-slate-200/80 shadow-card hover:shadow-card-hover transition-all flex flex-col justify-between p-5 group h-full"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="px-2.5 py-1 rounded-xl bg-[#E6F7F5] text-[#03A695] font-black font-mono text-xs border border-teal-100">
                        {projectCode}
                      </span>
                      <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                        Project {project.projectNumber} of 4
                      </span>
                    </div>
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      {project.gradeEligibility || comp?.gradeEligibility}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-sm font-black text-slate-900 group-hover:text-[#03A695] transition-colors line-clamp-1">
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
                    Enrolled Teams: <strong className="text-[#03A695]">{enrolledCount}</strong>
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
      ) : (
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-card divide-y divide-slate-100 overflow-hidden">
          {filteredProjects.map((project) => {
            const comp = competitions.find(c => c.categoryNumber === project.categoryNumber);
            const tools = project.softwareOrTools || [];
            const projectCode = `P${project.categoryNumber}-0${project.projectNumber}`;
            const enrolledCount = participants.filter(
              (p) =>
                (p.categoryNumber === project.categoryNumber && p.projectNumber === project.projectNumber) ||
                p.projectId === project.id ||
                p.projectTitle?.toLowerCase() === project.title?.toLowerCase()
            ).length;

            return (
              <div
                key={project.id}
                className="p-4 sm:p-5 hover:bg-slate-50/80 transition-all flex flex-col md:flex-row md:items-center justify-between gap-3 group"
              >
                <div className="flex items-start sm:items-center gap-3 min-w-0">
                  <span className="px-2.5 py-1 rounded-xl bg-[#E6F7F5] text-[#03A695] font-black font-mono text-xs border border-teal-100 shrink-0">
                    {projectCode}
                  </span>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm font-black text-slate-900 group-hover:text-[#03A695] transition-colors truncate">
                        {project.title}
                      </h3>
                      <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full shrink-0">
                        {project.gradeEligibility || comp?.gradeEligibility}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                      {project.objective || project.specification}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between md:justify-end gap-3 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
                  <div className="hidden lg:flex items-center gap-1.5">
                    {tools.slice(0, 2).map((tool, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded-lg bg-slate-100 text-slate-600 text-[10px] font-semibold"
                      >
                        {tool}
                      </span>
                    ))}
                  </div>
                  <span className="text-[11px] text-slate-500 font-medium">
                    Enrolled: <strong className="text-[#03A695]">{enrolledCount}</strong>
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
      )}

      {/* Project Specification Modal */}
      {activeProjectModal && (
        <Modal
          isOpen={!!activeProjectModal}
          onClose={() => setActiveProjectModal(null)}
          title={`Project Spec: P${activeProjectModal.categoryNumber}-0${activeProjectModal.projectNumber} — ${activeProjectModal.title}`}
          subtitle={`${activeProjectModal.categoryName} (${activeProjectModal.gradeEligibility}) • Official TTF 2026 Problem Statement`}
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
                  navigate('participants');
                }}
              >
                Assign / View Enrolled Teams
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
                <ul className="list-disc list-inside space-y-1 p-3.5 rounded-2xl bg-[#E6F7F5]/50 border border-teal-100 text-slate-700">
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
                    className="px-2.5 py-1 rounded-xl bg-[#E6F7F5] text-[#03A695] border border-teal-200 font-mono font-bold text-[11px]"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900">
              <p className="font-bold">Selection Rule:</p>
              <p className="mt-0.5 text-[11px]">
                Each participating team in Category {activeProjectModal.categoryNumber} ({activeProjectModal.gradeEligibility}) must select exactly <strong>ONE</strong> of the 4 designated projects to prepare, submit, and defend before the jury panel.
              </p>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
