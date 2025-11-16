// import React, { useState } from "react";
// import type { TimelineEntry } from "../../types/TimelineEntry";

// interface Props {
//   initial?: Partial<TimelineEntry>;
//   onSubmit: (data: Omit<TimelineEntry, 'id' | 'createdAt' | 'updatedAt'>) => void;
//   /** Optional id so a parent button can submit this form via form="..." */
//   formId?: string;
// }

// const EntryForm: React.FC<Props> = ({ initial, onSubmit, formId }) => {
//   const [form, setForm] = useState<Omit<TimelineEntry, 'id' | 'createdAt' | 'updatedAt'>>({
//     userId: 1,
//     title: initial?.title ?? "",
//     description: initial?.description ?? "",
//     eventDate: initial?.eventDate ?? new Date().toISOString(),
//     entryType: (initial?.entryType as any) ?? "Memory",
//     category: initial?.category ?? "",
//     imageUrl: initial?.imageUrl ?? "",
//     externalUrl: initial?.externalUrl ?? "",
//     sourceApi: (initial?.sourceApi as any) ?? "manual",
//     externalId: initial?.externalId ?? "",
//     metadata: initial?.metadata ?? {},
//   });

//   const set = (k: keyof typeof form, v: any) => setForm(s => ({ ...s, [k]: v }));

//   return (
//     <form
//       id={formId}
//       className="entry-form"
//       onSubmit={(e) => { e.preventDefault(); onSubmit(form); }}
//     >
//       <div className="ef-grid">
//         <div className="ef-field">
//           <label className="ef-label">Title</label>
//           <input className="ef-input" required
//                  value={form.title}
//                  onChange={(e)=>set("title", e.target.value)}/>
//         </div>

//         <div className="ef-field">
//           <label className="ef-label">Date/Time</label>
//           <input type="datetime-local" className="ef-input"
//                  value={new Date(form.eventDate).toISOString().slice(0,16)}
//                  onChange={(e)=>set("eventDate", new Date(e.target.value).toISOString())}/>
//         </div>

//         <div className="ef-field">
//           <label className="ef-label">Type</label>
//           <select className="ef-input"
//                   value={form.entryType}
//                   onChange={(e)=>set("entryType", e.target.value)}>
//             <option>Achievement</option>
//             <option>Activity</option>
//             <option>Milestone</option>
//             <option>Memory</option>
//           </select>
//         </div>

//         <div className="ef-field">
//           <label className="ef-label">Source</label>
//           <select className="ef-input"
//                   value={form.sourceApi}
//                   onChange={(e)=>set("sourceApi", e.target.value)}>
//             <option value="manual">Manual</option>
//             <option value="github">GitHub</option>
//             <option value="strava">Strava</option>
//             <option value="spotify">Spotify</option>
//             <option value="todoist">Todoist</option>
//           </select>
//         </div>

//         <div className="ef-field">
//           <label className="ef-label">Category</label>
//           <input className="ef-input"
//                  value={form.category ?? ""}
//                  onChange={(e)=>set("category", e.target.value)}/>
//         </div>

//         <div className="ef-field">
//           <label className="ef-label">Image URL</label>
//           <input className="ef-input"
//                  value={form.imageUrl ?? ""}
//                  onChange={(e)=>set("imageUrl", e.target.value)}/>
//         </div>

//         <div className="ef-field">
//           <label className="ef-label">External URL</label>
//           <input className="ef-input"
//                  value={form.externalUrl ?? ""}
//                  onChange={(e)=>set("externalUrl", e.target.value)}/>
//         </div>

//         <div className="ef-field ef-col-2">
//           <label className="ef-label">Description</label>
//           <textarea className="ef-textarea"
//                     rows={4}
//                     value={form.description}
//                     onChange={(e)=>set("description", e.target.value)}/>
//         </div>
//       </div>
//       {/* no submit button here – modal footer has the buttons */}
//     </form>
//   );
// };

// export default EntryForm;









import React, { useState } from "react";
import type { TimelineEntry } from "../../types/TimelineEntry";

interface Props {
  initial?: Partial<TimelineEntry>;
  onSubmit: (data: Omit<TimelineEntry, 'id' | 'createdAt' | 'updatedAt'>) => void;
  formId?: string;
}

const EntryForm: React.FC<Props> = ({ initial, onSubmit, formId }) => {
  const [form, setForm] = useState<Omit<TimelineEntry, 'id' | 'createdAt' | 'updatedAt'>>({
    // userId removed – backend uses JWT
    title: initial?.title ?? "",
    description: initial?.description ?? "",
    eventDate: initial?.eventDate ?? new Date().toISOString(),
    entryType: (initial?.entryType as any) ?? "Note",
    category: initial?.category ?? "",
    imageUrl: initial?.imageUrl ?? "",
    externalUrl: initial?.externalUrl ?? "",
    sourceApi: (initial?.sourceApi as any) ?? "manual",
    externalId: initial?.externalId ?? "",
    metadata: (initial?.metadata as any) ?? "{}",   // backend expects string
  });

  const set = (k: keyof typeof form, v: any) => setForm(s => ({ ...s, [k]: v }));

  return (
    <form
      id={formId}
      className="entry-form"
      onSubmit={(e) => { e.preventDefault(); onSubmit(form); }}
    >
      <div className="ef-grid">
        <div className="ef-field">
          <label className="ef-label">Title</label>
          <input className="ef-input" required
                 value={form.title}
                 onChange={(e)=>set("title", e.target.value)}/>
        </div>

        <div className="ef-field">
          <label className="ef-label">Date/Time</label>
          <input type="datetime-local" className="ef-input"
                 value={new Date(form.eventDate).toISOString().slice(0,16)}
                 onChange={(e)=>set("eventDate", new Date(e.target.value).toISOString())}/>
        </div>

        <div className="ef-field">
          <label className="ef-label">Type</label>
          <select className="ef-input"
                  value={form.entryType}
                  onChange={(e)=>set("entryType", e.target.value)}>
            <option>Note</option>
            <option>Milestone</option>
            <option>Achievement</option>
          </select>
        </div>

        <div className="ef-field">
          <label className="ef-label">Source</label>
          <select className="ef-input"
                  value={form.sourceApi}
                  onChange={(e)=>set("sourceApi", e.target.value)}>
            <option value="manual">Manual</option>
            <option value="github">GitHub</option>
            <option value="strava">Strava</option>
            <option value="spotify">Spotify</option>
            <option value="todoist">Todoist</option>
          </select>
        </div>

        <div className="ef-field">
          <label className="ef-label">Category</label>
          <input className="ef-input"
                 value={form.category ?? ""}
                 onChange={(e)=>set("category", e.target.value)}/>
        </div>

        <div className="ef-field">
          <label className="ef-label">Image URL</label>
          <input className="ef-input"
                 value={form.imageUrl ?? ""}
                 onChange={(e)=>set("imageUrl", e.target.value)}/>
        </div>

        <div className="ef-field">
          <label className="ef-label">External URL</label>
          <input className="ef-input"
                 value={form.externalUrl ?? ""}
                 onChange={(e)=>set("externalUrl", e.target.value)}/>
        </div>

        <div className="ef-field ef-col-2">
          <label className="ef-label">Description</label>
          <textarea className="ef-textarea"
                    rows={4}
                    value={form.description}
                    onChange={(e)=>set("description", e.target.value)}/>
        </div>
      </div>
    </form>
  );
};

export default EntryForm;
