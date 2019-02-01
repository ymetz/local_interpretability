import React from "react";
import {config} from "../app_config";
import '../../public/css/ImageComponent.css';

const Checkmark = ({ selected }) => (
  <div
    style={
      selected
        ? { left: "4px", top: "4px", position: "absolute", zIndex: "1" }
        : { display: "none" }
    }
  >
    <svg
      style={{ fill: "white", position: "absolute" }}
      width="24px"
      height="24px"
    >
      <circle cx="12.5" cy="12.2" r="8.292" />
    </svg>
    <svg
      style={{ fill: "#06befa", position: "absolute" }}
      width="24px"
      height="24px"
    >
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
    </svg>
  </div>
);

const imgStyle = {
  transition: "transform .135s cubic-bezier(0.0,0.0,0.2,1),opacity linear .15s",
  outline: "15px solid black"
};
const selectedImgStyle = {
  transform: "translateZ(0px) scale3d(0.9, 0.9, 1)",
  transition: "transform .135s cubic-bezier(0.0,0.0,0.2,1),opacity linear .15s"
};
const cont = {
  backgroundColor: "#eeeeee",
  cursor: "pointer",
  overflow: "hidden",
  position: "relative"
};

const SelectedImage = ({
  index,
  onClick,
  photo,
  margin,
  direction,
  top,
  left,
  classResult,
  labels
}) => {
  //calculate x,y scale
  const sx = (100 - (30 / photo.width) * 100) / 100;
  const sy = (100 - (30 / photo.height) * 100) / 100;
  selectedImgStyle.transform = `translateZ(0px) scale3d(${sx}, ${sy}, 1)`;

  let classifier_result = {};
  /*
  if (!(classResult.length === 0 || labels.length === 0)){
    let photo_name = photo.src.split('/').pop();
    let prediction = classResult[photo_name];
    if (prediction[config.nr_of_top_predictions-1].class === labels[photo_name][0]){
      classifier_result = prediction[config.nr_of_top_predictions-1];
      classifier_result.top_one = true;
    }
  }*/

  if (direction === "column") {
    cont.position = "absolute";
    cont.left = left;
    cont.top = top;
  }
  return (
    <div
      style={{ margin, height: photo.height, width: photo.width, ...cont }}
      styleName="standard_image"
      className={!photo.selected ? "not-selected" : ""}
    >
      <Checkmark selected={photo.selected ? true : false} />
      <img
        style={
          photo.selected
            ? { ...imgStyle, ...selectedImgStyle }
            : { ...imgStyle }
        }
        {...photo}
        onClick={e => onClick(e, { index, photo })}
      />
      <style>{`.not-selected:hover{outline:2px solid #06befa}`}</style>
    </div>
  );
};

export default SelectedImage;
