# Portfolio Studio guide

Open the local dev URL and choose **Portfolio Studio**, or use `#/admin`. A deployed Studio requires a configured Supabase project and authorized owner account.

1. Choose a collection and create a record. Set a unique URL slug, title, summary and relevant type-specific fields. Add structured story sections, bullet lists, tags and safe links.
2. Open **Media** to upload multiple images/video/PDF files or attach hosted URLs. Set accessible descriptions/captions, reorder items, choose a cover, and set video posters. Retain originals for backup.
3. Open **Relations & scene** to associate skills/projects/experience. Create a scene node and open it in **Scene & connections**.
4. Choose a world and layout. Select objects in the real 3D preview or the node selector. Drag geometry to move it, use coordinate fields, or Alt+Arrow keys on a focused node label. Manual positions override automatic layout. Recalculate preserves overrides; Reset positions removes them.
5. Adjust geometry, material, accent, scale, labels, visibility and animation. Add an edge, choose its endpoints and line/tube/ribbon style. Invalid references and self-connections cannot publish.
6. **Save draft** persists changes without replacing the public portfolio. Autosave runs after edits; validation/storage failures are shown. **Undo/redo** restores edits during the session. Delete is recoverable with Undo; archived records can be restored.
7. Set records to Published and click **Publish**. Review the confirmation: local development publication updates only this browser; cloud publication updates visitors. Reload the public page and inspect the new record.
8. **Version history** restores a prior publication into the draft. Review and publish it to roll back. **Export backup** produces validated JSON; **Import** validates a backup, asks for confirmation, and replaces only the draft.

New custom sections can use their own world. They remain ordinary records with structured content. The public 3D engine is the same class used in the editor preview, not a separate mockup.

A public record can exist without a node and remains readable in its collection. A draft/archived record and its nodes do not appear in the published public scene. An unavailable optional model falls back to procedural geometry. Media errors show an explicit failure state.

The default presets are neural-core, neural-node, neural-cluster and neural-chip. The earlier core, portal, monolith, chip, tower, archive and beacon remain available for existing edits. Materials are titanium, glass and emissive. Layout strategies include network, radial, hierarchical, timeline, force and manual. New procedural presets are registered in GeometryFactory and added to the schema/Studio allowlists; content never supplies executable code.

For Skills, choose the real **Category/domain** in Details, then create a scene node. Its parent edge is added automatically. Add documented project associations in Relations & scene; corresponding project nodes and directed application edges are synchronized automatically. Select a domain or a technology in the scene picker to preview its focused branch. Removing a required parent edge is refused; change the domain instead. A new domain is a Category record with a scene node connected to the professional identity. Existing record IDs are retained even where their historical names differ from their displayed titles.

The public domain overview intentionally prioritizes domain labels. Its technology geometry remains connected; selecting a domain reveals the labeled hierarchy and its supporting projects. Desktop and phone layouts use the same records and relationships. The Home/root control, All domains link, and accessible content cards provide predictable exits.
