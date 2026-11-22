import sanitizeHtml from 'sanitize-html';

/**
 * Blog content is rendered with dangerouslySetInnerHTML on the public site, so it is sanitised on
 * write: formatting, links, images and tables survive; scripts, event handlers, iframes, forms,
 * inline styles and javascript: URLs do not.
 */
export const sanitizeRichText = (html: string): string =>
  sanitizeHtml(html, {
    allowedTags: [
      ...sanitizeHtml.defaults.allowedTags,
      'img', 'figure', 'figcaption', 'picture', 'source', 'del', 'ins', 'sup', 'sub', 'mark',
    ],
    allowedAttributes: {
      a: ['href', 'name', 'target', 'rel', 'title'],
      img: ['src', 'srcset', 'alt', 'title', 'width', 'height', 'loading'],
      source: ['srcset', 'type', 'media'],
      th: ['colspan', 'rowspan', 'scope'],
      td: ['colspan', 'rowspan'],
      ol: ['start', 'type'],
      '*': ['id', 'class', 'lang', 'dir'],
    },
    allowedSchemes: ['http', 'https', 'mailto', 'tel'],
    allowedSchemesByTag: { img: ['https', 'data'] },
    allowProtocolRelative: false,
    transformTags: {
      a: (tagName, attribs) => ({
        tagName,
        attribs:
          attribs.target === '_blank'
            ? { ...attribs, rel: 'noopener noreferrer' }
            : attribs,
      }),
    },
  });
