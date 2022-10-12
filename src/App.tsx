import "./styles.css";
import "./Thumbnails.css";
import Thumbnails from "./Thumbnails";
import useIIIFManifest from "./useIIIFManifest";
import { ViewingDirection, ViewingHint } from "@iiif/vocabulary";
import { Canvas } from "manifesto.js";
import { useControls } from "leva";
import { useEffect } from "react";

export default function App() {
  const [{ manifest, paged, viewingDirection, canvasIndex }, set] = useControls(
    () => ({
      manifest: {
        options: {
          "Non-paged at Start":
            "https://sessionpapers.is.ed.ac.uk/whiiif/resources/manifests/ADV-CampbellsColl_Vol_99-paged",
          "Non-paged at End":
            "https://heaney0.ugent.be/custom-manifests/B_OB_MS685.json",
          "v2 manifest without viewingHint:paged": "https://adore.ugent.be/IIIF/manifests/archive.ugent.be:018970A2-B1E8-11DF-A2E0-A70579F64438",
        }
      },
      paged: false,
      viewingDirection: {
        options: {
          "Left to Right": ViewingDirection.LEFT_TO_RIGHT,
          "Right to Left": ViewingDirection.RIGHT_TO_LEFT
        }
      },
      canvasIndex: {
        value: 0,
        min: 0,
        // max: 0,
        step: 1
      }
    })
  );

  const { sequence, canvases, thumbs, paged: _paged, viewingDirection: _viewingDirection } = useIIIFManifest(manifest);

  useEffect(() => {
    set({
      paged: _paged,
      viewingDirection: _viewingDirection,
    });
  }, [_paged, _viewingDirection]);

  function getPagedIndices(): number[] {
    let indices: number[] = [];

    // if it's a continuous manifest, get all resources.
    if (sequence.getViewingHint() === ViewingHint.CONTINUOUS) {
      // get all canvases to be displayed inline
      indices = canvases.map((_canvas: Canvas, index: number) => {
        return index;
      });
    } else {
      if (!paged) {
        // one-up
        // if the current canvas index is for a non-paged canvas, only return that canvas index
        // don't pair it with another in two-up
        indices.push(canvasIndex);
      } else {
        // two-up
        if (
          canvasIndex === 0 ||
          (canvasIndex === canvases.length && canvases.length % 2 === 0)
        ) {
          indices = [canvasIndex];
        } else if (canvasIndex % 2 === 0) {
          // the current canvas index is even
          // therefore it appears on the right

          // only include prev canvas if it's not non-paged and the current canvas isn't non-paged
          const currentCanvas: Canvas | null = canvases[canvasIndex];
          const prevCanvas: Canvas | null = canvases[canvasIndex - 1];
          if (
            currentCanvas?.getViewingHint() !== ViewingHint.NON_PAGED &&
            prevCanvas?.getViewingHint() !== ViewingHint.NON_PAGED
          ) {
            indices = [canvasIndex - 1, canvasIndex];
          } else {
            indices = [canvasIndex];
          }
        } else {
          // the current canvas index is odd
          // therefore it appears on the left

          // only include next canvas if it's not non-paged and the current canvas isn't non-paged
          const currentCanvas: Canvas | null = canvases[canvasIndex];
          const nextCanvas: Canvas | null = canvases[canvasIndex + 1];
          if (
            currentCanvas?.getViewingHint() !== ViewingHint.NON_PAGED &&
            nextCanvas?.getViewingHint() !== ViewingHint.NON_PAGED
          ) {
            indices = [canvasIndex, canvasIndex + 1];
          } else {
            indices = [canvasIndex];
          }
        }

        if (viewingDirection === ViewingDirection.RIGHT_TO_LEFT) {
          indices = indices.reverse();
        }
      }
    }

    return indices;
  }

  return (
    <div className="App">
      {thumbs && (
        <div
          className="thumbsView"
          style={{
            height: "400px",
            width: "230px"
          }}
        >
          <Thumbnails
            thumbs={thumbs}
            selected={getPagedIndices()}
            viewingDirection={viewingDirection}
            paged={paged}
            onClick={(thumb) => {
              set({
                canvasIndex: thumb.index
              });
            }}
          />
        </div>
      )}
      <div
        style={{
          marginTop: "1rem"
        }}
      >
        <button
          disabled={canvasIndex === 0}
          onClick={() => {
            set({
              canvasIndex: canvasIndex - 1
            });
          }}
        >
          Previous
        </button>
        <span
          style={{
            marginLeft: "0.5rem"
          }}
        >
          {canvasIndex}
        </span>
        <button
          disabled={canvasIndex === canvases?.length - 1}
          style={{
            marginLeft: "0.5rem"
          }}
          onClick={() => {
            set({
              canvasIndex: canvasIndex + 1
            });
          }}
        >
          Next
        </button>
      </div>
    </div>
  );
}
