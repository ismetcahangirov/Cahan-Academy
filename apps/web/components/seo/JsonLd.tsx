interface JsonLdProps {
  data: object;
}

/**
 * JSON-LD script. `<` is escaped to < so CMS text containing `</script>` cannot break out of the tag.
 */
export default function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }}
    />
  );
}
