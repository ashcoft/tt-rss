/* global xhr, App, Plugins, Article, Notify */

Plugins.Af_Readability = {
    orig_attr_name: 'data-readability-orig-content',
    embed: function(id) {
        const attr = this.orig_attr_name;
        const content = document.querySelector(App.isCombinedMode() ? `.cdm[data-article-id="${id}"] .content-inner` :
            `.post[data-article-id="${id}"] .content`);

        if (!content) {
            Notify.error("Unable to find article content element");
            return;
        }

        if (content.hasAttribute(attr)) {
            content.innerHTML = content.getAttribute(attr);
            content.removeAttribute(attr);

            if (App.isCombinedMode()) Article.cdmMoveToId(id);

            return;
        }

        Notify.progress("Loading, please wait...");

        xhr.json("backend.php", App.getPhArgs("af_readability", "embed", {id: id}), (reply) => {

            if (reply.content) {
                content.setAttribute(attr, content.innerHTML);
                content.innerHTML = reply.content;
                Notify.close();

                if (App.isCombinedMode()) Article.cdmMoveToId(id);

            } else {
                Notify.error("Unable to fetch full text for this article");
            }
        });
    },

    /**
     * Fetch content from a directly pasted URL
     */
    fetchUrl: function() {
        const url = prompt("Enter the URL to fetch content from:");
        if (!url || !url.trim()) return;

        const trimmedUrl = url.trim();

        // Basic URL validation
        if (!trimmedUrl.match(/^https?:\/\//i)) {
            Notify.error("Please enter a valid HTTP or HTTPS URL");
            return;
        }

        Notify.progress("Fetching content, please wait...");

        xhr.json("backend.php", App.getPhArgs("af_readability", "direct_fetch", {url: trimmedUrl}), (reply) => {
            Notify.close();

            if (reply.content) {
                // Open a dialog or modal with the fetched content
                this.showFetchedContent(reply.content, trimmedUrl);
            } else {
                const errorMsg = reply.error || "Unable to fetch content from URL";
                Notify.error(errorMsg);
            }
        });
    },

    /**
     * Display fetched content in a modal dialog
     */
    showFetchedContent: function(content, url) {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.8);z-index:1000;display:flex;align-items:center;justify-content:center;';

        const dialog = document.createElement('div');
        dialog.style.cssText = 'background:#fff;max-width:800px;max-height:80vh;overflow:auto;padding:20px;border-radius:8px;position:relative;';

        dialog.innerHTML = `
            <button class="close" style="position:absolute;top:10px;right:10px;background:none;border:none;font-size:24px;cursor:pointer;">&times;</button>
            <h3 style="margin-top:0;">Fetched Content</h3>
            <p style="color:#666;font-size:12px;">Source: <a href="${url}" target="_blank">${url}</a></p>
            <div class="content" style="margin-top:15px;border-top:1px solid #eee;padding-top:15px;">${content}</div>
        `;

        modal.appendChild(dialog);
        document.body.appendChild(modal);

        // Close handlers
        modal.addEventListener('click', function(e) {
            if (e.target === modal || e.target.className === 'close') {
                document.body.removeChild(modal);
            }
        });

        // ESC key to close
        document.addEventListener('keydown', function escHandler(e) {
            if (e.key === 'Escape') {
                document.body.removeChild(modal);
                document.removeEventListener('keydown', escHandler);
            }
        });
    }
};
