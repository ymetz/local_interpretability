import os
import matplotlib.pyplot as plt
from skimage.segmentation import mark_boundaries, find_boundaries
from lime import lime_image
import pickle


def create_lime_explanations(dataset, model, top_preds):
    file_list = []
    for file in dataset.file_list[:25]:
        file_list.append(file['src'].split('/')[-1])
    transformed_images = model.transform_images([os.path.join(dataset.dataset_path, file) for file in file_list])

    explanation_directory = os.path.join(dataset.dataset_path, 'current_explanations')
    if not os.path.isdir(explanation_directory):
        os.makedirs(explanation_directory)

    explainer = lime_image.LimeImageExplainer()
    for idxExpl in range(len(transformed_images)):
        explanation = explainer.explain_instance(transformed_images[idxExpl], model.predict_images,
                                                 labels=[label['class'] + model.logit_shift for label in top_preds[file_list[idxExpl]]]
                                                 , hide_color=0, num_samples=1500)

        for pred in top_preds[file_list[idxExpl]]:
            temp, mask = explanation.get_image_and_mask(pred['class'] + model.logit_shift, positive_only=False,
                                                        num_features=1000, hide_rest=False, min_weight=0.02)

            plt.imsave(os.path.join(explanation_directory, 'lime_' + str(pred['class']) + '_' + file_list[idxExpl]),
                       mark_boundaries(temp / 2 + 0.5, mask))

