import React, { useState } from "react";
import { useTimeline } from "../../hooks/useTimeline";
import EntryFilter from "./EntryFilter";
import EntryForm from "./EntryForm";
import Modal from "../ui/Modal";
import "/src/index.css";
import TimelineEntry from "./TimelineEntry";
import type { TimelineEntry as T } from "../../types/TimelineEntry"; // ⬅️ add this

const TimelineView: React.FC = () => {
  const { entries, loading, remove, add, update } = useTimeline();
  const [showModal, setShowModal] = useState(false);

  // 🔧 edit state
  const [editing, setEditing] = useState<T| null>(null);

  const formId = "timeline-entry-form";
  const editFormId   = "timeline-entry-form-edit";

  return (
    <div className="timeline-wrap">
      <div className="timeline-hero">
        <h2 className="timeline-title">Your Timeline</h2>
        <p className="timeline-sub">Filter and manage entries</p>
      </div>

      {/* Filters */}
      <div className="entry-filter">
        <EntryFilter />
      </div>

      {/* Add Entry button */}
      <div style={{display:"flex", justifyContent:"flex-end", marginBottom: "8px"}}>
        <button className="tl-btn tl-btn-primary" onClick={()=>setShowModal(true)}>
          + Add Entry
        </button>
      </div>

      {/* Entries */}
      <div className="tl-grid">
        {loading && <div>Loading…</div>}
        {!loading && entries.length === 0 && <div>No entries match your filters.</div>}
        {entries.map(e => (
          <TimelineEntry key={e.id} entry={e} onDelete={async (id) => {
            if (confirm("Delete this entry? This can’t be undone.")) {
              await remove(id);
            }
          }}
          onEdit={(entry) => setEditing(entry)}   // ⬅️ enable Edit button
        />
      ))}
      </div>

      {/* Modal for new entry */}
      <Modal
        isOpen={showModal}
        title="New Timeline Entry"
        onClose={()=>setShowModal(false)}
        footer={
          <>
            <button className="tl-btn" onClick={()=>setShowModal(false)}>Cancel</button>
            <button className="tl-btn tl-btn-link" form={formId} type="submit">Save Entry</button>
          </>
        }
      >
        <EntryForm
          formId={formId}
          onSubmit={async (data) => {
            await add(data);
            setShowModal(false);
          }}
        />
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={!!editing}
        title="Edit Timeline Entry"
        onClose={()=>setEditing(null)}
        footer={
          <>
            <button className="tl-btn" onClick={()=>setEditing(null)}>Cancel</button>
            <button className="tl-btn tl-btn-link" form={editFormId} type="submit">Save Changes</button>
          </>
        }
      >
        {editing && (
          <EntryForm
            formId={editFormId}
            initial={editing}
            onSubmit={async (data) => {
              // turn full form back into a patch
              await update(editing.id, {
                title: data.title,
                description: data.description ?? undefined,
                eventDate: data.eventDate,
                entryType: data.entryType ?? undefined,
                category: data.category ?? undefined,
                sourceApi: data.sourceApi ?? undefined,
                externalUrl: data.externalUrl ?? undefined,
              });
              setEditing(null);
            }}
          />
        )}
      </Modal>
    </div>
  );
};

export default TimelineView;
