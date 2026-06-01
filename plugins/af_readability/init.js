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
    }
};