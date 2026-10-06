import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import {
  ListOrdered,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  Sparkles,
  Save,
  HelpCircle,
  Eye,
  Layers,
  ArrowUpDown
} from 'lucide-react';

export const RubricBuilderPage: React.FC = () => {
  const {
    rubrics,
    competitions,
    selectedCompetitionId,
    updateRubricCriterion,
    addRubricCriterion,
    deleteRubricCriterion,
    addToast
  } = useApp();

  const [activeRubricId, setActiveRubricId] = useState<string>('rub-robotics');
  const [showPreviewModal, setShowPreviewModal] = useState<boolean>(false);

  const currentRubric = rubrics[activeRubricId] || rubrics['rub-robotics'];
  const totalMaxMarks = currentRubric.criteria.reduce((sum, c) => sum + Number(c.maxMarks || 0), 0);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-card">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl lg:text-2xl font-black text-slate-900 tracking-tight">
              Rubric Builder & Evaluation Engine
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-[#EAF3FF] text-[#0057B8] text-xs font-bold">
              Standard 100-pt Framework
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Configure dynamic evaluation criteria, maximum marks, scoring weights, and passing thresholds
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            icon={<Eye className="w-3.5 h-3.5" />}
            onClick={() => setShowPreviewModal(true)}
          >
            Preview Rubric
          </Button>

          <Button
            variant="orange"
            size="sm"
            icon={<Plus className="w-4 h-4" />}
            onClick={() => addRubricCriterion(activeRubricId)}
          >
            + Add Criterion
          </Button>
        </div>
      </div>

      {/* Rubric Category Switcher */}
      <div className="flex items-center gap-2 bg-white p-2 rounded-2xl border border-slate-200/80 overflow-x-auto shadow-xs">
        {Object.entries(rubrics).map(([id, rub]) => (
          <button
            key={id}
            onClick={() => setActiveRubricId(id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
              activeRubricId === id
                ? 'bg-[#0057B8] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            {rub.name} ({rub.criteria.length} Criteria)
          </button>
        ))}
      </div>

      {/* Main Rubric Editor Canvas */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-card p-6 lg:p-8 space-y-6">
        {/* Top Rubric Meta */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-black text-slate-900">
              {currentRubric.name}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {currentRubric.description}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-[#EAF3FF] border border-blue-100 text-center min-w-[120px]">
              <span className="text-[10px] font-bold uppercase text-slate-500">
                Calculated Max Score
              </span>
              <p className="text-2xl font-black text-[#0057B8]">
                {totalMaxMarks} <span className="text-xs font-bold text-slate-500">/ 100</span>
              </p>
            </div>
            <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-100 text-center min-w-[110px]">
              <span className="text-[10px] font-bold uppercase text-slate-500">
                Passing Cutoff
              </span>
              <p className="text-2xl font-black text-emerald-700">
                {currentRubric.passingScore} <span className="text-xs font-bold text-slate-500">pts</span>
              </p>
            </div>
          </div>
        </div>

        {/* Criteria Rows List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Evaluation Criteria Breakdown
            </h3>
            <span className="text-xs font-semibold text-slate-500">
              {currentRubric.criteria.length} Parameters Active
            </span>
          </div>

          {currentRubric.criteria.map((crit, index) => (
            <div
              key={crit.id}
              className="p-5 rounded-2xl bg-[#F6F9FD] border border-slate-200/80 hover:border-blue-300 transition-all space-y-3 group"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center font-bold text-xs text-[#0057B8] shrink-0">
                    {index + 1}
                  </div>
                  <input
                    type="text"
                    value={crit.name}
                    onChange={(e) =>
                      updateRubricCriterion(activeRubricId, crit.id, 'name', e.target.value)
                    }
                    className="font-bold text-slate-900 text-sm bg-transparent border-b border-transparent hover:border-slate-300 focus:border-[#0057B8] focus:bg-white px-1.5 py-0.5 rounded focus:outline-none flex-1 transition-all"
                  />
                </div>

                {/* Score Controls */}
                <div className="flex items-center gap-3 shrink-0">
                  <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-2xs">
                    <span className="text-xs font-bold text-slate-500">Max Marks:</span>
                    <input
                      type="number"
                      value={crit.maxMarks}
                      onChange={(e) =>
                        updateRubricCriterion(
                          activeRubricId,
                          crit.id,
                          'maxMarks',
                          Number(e.target.value)
                        )
                      }
                      className="w-12 text-center font-black text-sm text-[#0057B8] bg-slate-50 rounded border border-slate-200 py-0.5 focus:outline-none"
                    />
                    <span className="text-xs font-bold text-slate-400">pts</span>
                  </div>

                  {/* Delete button */}
                  <button
                    onClick={() => deleteRubricCriterion(activeRubricId, crit.id)}
                    className="w-8 h-8 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 flex items-center justify-center transition-colors cursor-pointer"
                    title="Delete this criterion"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Description field */}
              <div className="pl-11">
                <textarea
                  rows={2}
                  value={crit.description}
                  onChange={(e) =>
                    updateRubricCriterion(activeRubricId, crit.id, 'description', e.target.value)
                  }
                  className="w-full text-xs text-slate-600 bg-white/80 border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:bg-white focus:border-[#0057B8] transition-all resize-none"
                  placeholder="Provide grading guidance for judges..."
                />
              </div>
            </div>
          ))}
        </div>

        {/* Save Bar */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
          <span className="text-xs text-slate-500 italic">
            * Changes to criteria dynamically recalculate live scorecards for judges in real time.
          </span>
          <Button
            variant="orange"
            size="sm"
            icon={<Save className="w-4 h-4" />}
            onClick={() =>
              addToast({
                type: 'success',
                title: 'Rubric Configuration Saved',
                message: `${currentRubric.name} successfully updated with ${totalMaxMarks} max points.`
              })
            }
          >
            Save Rubric Changes
          </Button>
        </div>
      </div>

      {/* Preview Modal */}
      <Modal
        isOpen={showPreviewModal}
        onClose={() => setShowPreviewModal(false)}
        title={`Live Judge Preview: ${currentRubric.name}`}
        subtitle="This is how judges will see and grade this rubric in the scoring desk"
        maxWidth="2xl"
      >
        <div className="space-y-4 text-xs">
          <div className="p-4 rounded-2xl bg-[#EAF3FF] border border-blue-200 flex items-center justify-between">
            <span className="font-bold text-[#003B7A]">Standard 100-Point Model</span>
            <span className="font-black text-[#0057B8] text-sm">{totalMaxMarks} Total Marks</span>
          </div>

          <div className="space-y-3">
            {currentRubric.criteria.map((c, i) => (
              <div
                key={c.id}
                className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-between"
              >
                <div>
                  <h4 className="font-bold text-slate-900">
                    {i + 1}. {c.name}
                  </h4>
                  <p className="text-slate-500 mt-0.5 text-[11px]">{c.description}</p>
                </div>
                <div className="text-right shrink-0 pl-4">
                  <span className="px-3 py-1 rounded-xl bg-slate-100 font-bold text-slate-800">
                    [ 0 / {c.maxMarks} ]
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end pt-3">
            <Button
              variant="primary"
              size="sm"
              onClick={() => setShowPreviewModal(false)}
            >
              Close Preview
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
