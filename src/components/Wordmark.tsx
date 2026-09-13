interface WordmarkProps {
  white?: boolean;
}

export function Wordmark({ white }: WordmarkProps) {
  return (
    <div className={'wordmark' + (white ? ' wordmark--white' : '')} role="img" aria-label="Admission Possible">
      <img className="wordmark__cap" src="/brand/admission-cap.png" alt="" width="905" height="668" />
      <span className="wordmark__name" aria-hidden="true">
        Admission
        <br />
        Possible
      </span>
    </div>
  );
}
