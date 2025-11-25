import React, { useState } from "react";
import type { TimelineEntry } from "../../types/TimelineEntry";

interface Props {
  initial?: Partial<TimelineEntry>;
  onSubmit: (data: Omit<TimelineEntry, 'id' | 'createdAt' | 'updatedAt'>) => void;
  formId?: string;
}

const EntryForm: React.FC<Props> = ({ initial, onSubmit, formId }) => {
  const [form, setForm] = useState<Omit<TimelineEntry, 'id' | 'createdAt' | 'updatedAt'>>({
    title: initial?.title ?? "",
    description: initial?.description ?? "",

    eventDate: initial?.eventDate ?? new Date().toISOString(),
    entryType: (initial?.entryType as any) ?? "Note",
    category: initial?.category ?? "",
    imageUrl: initial?.imageUrl ?? "",
    externalUrl: initial?.externalUrl ?? "",
    sourceApi: (initial?.sourceApi as any) ?? "manual",
    externalId: initial?.externalId ?? "",
    metadata: (initial?.metadata as any) ?? "{}",
    fileAttachment: initial?.fileAttachment ?? "",
    fileName: initial?.fileName ?? "",
    fileType: initial?.fileType ?? "",
  });

  const [uploading, setUploading] = useState(false);

  const set = (k: keyof typeof form, v: any) => setForm(s => ({ ...s, [k]: v }));


  const toLocalInputString = (isoString: string) => {
    const date = new Date(isoString);

    const local = new Date(date.getTime() - (date.getTimezoneOffset() * 60000));
    return local.toISOString().slice(0, 16); 
  };
 

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
  
    if (file.size > 10 * 1024 * 1024) {
      alert('File too large! Max 10MB.');
      return;
    }
  
    setUploading(true);
  
    const formData = new FormData();
    formData.append('file', file);
  
    try {
      const token = localStorage.getItem("pt_jwt");
      const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:5001";
      
      const res = await fetch(`${API_BASE}/api/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      
      if (!res.ok) throw new Error('Upload failed');
      const data = await res.json();
  
      set("fileAttachment", data.filePath);
      set("fileName", file.name);
      set("fileType", file.type);
    } catch (err) {
      alert('Upload failed');
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

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
          {/* Use the new helper here */}
          <input 
            type="datetime-local" 
            className="ef-input"
            value={toLocalInputString(form.eventDate)}
            onChange={(e) => {

              set("eventDate", new Date(e.target.value).toISOString());
            }}
          />
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
          <label className="ef-label">Attach File</label>
          <input 
            type="file" 
            className="ef-input"
            accept="image/*,.pdf,.doc,.docx"
            onChange={handleFileUpload}
            disabled={uploading}
          />
          {uploading && <div style={{marginTop: '8px', fontSize: '14px', color: '#666'}}>Uploading...</div>}
          {form.fileName && !uploading && (
            <div style={{marginTop: '8px', fontSize: '14px', color: '#28a745'}}>
              ✓ {form.fileName}
            </div>
          )}
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