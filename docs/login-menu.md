# Customize the website Login menu

Open **CMS → Website Content → Website Settings → Login Button & Dropdown**.

- Turn **Show login button** off to hide the entire button.
- Change **Button label** to rename it.
- Under **Dropdown entries**, add, reorder or delete rows.
- Turn **Show this entry** off to hide a row without deleting it.
- Edit **Entry label** and **Link**. Links support HTTPS URLs, local paths such as `/admin`, and page anchors. Clear the link to display a non-clickable label.
- Enable **Open link in a new tab** when appropriate.
- Save Website Settings to apply the changes. If every entry is hidden or deleted, the Login button is hidden too.

The original Student, Parent and Staff entries remain until the menu is customized. Deleted entries are not restored automatically. This controls the website header menu; it does not change CMS authentication or access permissions. Existing desktop visibility and mobile search behavior are preserved.

Validation: 190 unit tests passed, including 19 checks for menu defaults, hiding, deletion, ordering and link validation. TypeScript and lint passed. Browser checks verified the existing menu, outside-click dismissal, Escape focus restoration and no page errors. Settings cache keys were updated for the new menu data shape.
