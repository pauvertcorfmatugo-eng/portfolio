export default function SectionHead({ index, title, sub, id }) {
  return (
    <header className="sec-head reveal">
      <span className="sec-index">{index}</span>
      <h2 className="sec-title" id={id}>
        {title}
      </h2>
      {sub && <p className="sec-sub">{sub}</p>}
    </header>
  );
}
