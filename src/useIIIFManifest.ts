import { useEffect, useState } from "react";
// @ts-ignore
import { loadManifest, parseManifest } from "manifesto.js/dist-umd/manifesto";
import { ViewingHint } from "@iiif/vocabulary";

export interface Options {
  thumbWidth: number;
}

const useIIIFManifest = (
  manifestId: string,
  options: Options = {
    thumbWidth: 90
  }
) => {
  const [value, setValue] = useState<any>({});

  useEffect(() => {
    loadManifest(manifestId).then((json: any) => {
      const manifest = parseManifest(json);
      const sequence = manifest.getSequences()[0];
      const canvases = sequence.getCanvases();
      const thumbs = sequence.getThumbs(options.thumbWidth);
      const paged = sequence.getViewingHint() === ViewingHint.PAGED || manifest.isPagingEnabled();
      const viewingDirection = sequence.getViewingDirection() || manifest.getViewingDirection();
      setValue({ manifest, sequence, canvases, thumbs, paged, viewingDirection });
    });
  }, [manifestId]);
  return value;
};

export default useIIIFManifest;
