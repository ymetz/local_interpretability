import time
import os
import matplotlib.pyplot as plt
from skimage.segmentation import mark_boundaries, find_boundaries
from lime import lime_image
import pickle


def create_explanation_images(dataset, model):
    file_list = []
    for file in dataset.file_list:
        file_list.append(file['src'].split('/')[-1])
    transformed_images = model.transform_images([os.path.join(dataset.dataset_path, file) for file in file_list])

    top_pred_file_name = os.path.join(dataset.dataset_path, dataset.dataset_name+'-top_preds-'+'.pkl')
    if os.path.isfile(top_pred_file_name):
        with open(top_pred_file_name, 'rb') as f:
            dataset.top_predictions = pickle.load(f)
    else:
        top_preds = {}
        # I'm dividing by 2 and adding 0.5 because of how this Inception represents images
        preds = model.predict_images(transformed_images)
        for idxPred in range(len(preds)):
            top_5_labels = []
            for x in preds.argsort()[idxPred][-5:]:
                top_5_labels.append({'class': int(x), 'score': float(preds[idxPred, x])})
            top_preds[file_list[idxPred]] = top_5_labels
        dataset.top_predictions = top_preds
        with open(top_pred_file_name, 'wb') as f:
            pickle.dump(top_preds, f, pickle.HIGHEST_PROTOCOL)

    explanation_directory = os.path.join(dataset.dataset_path, 'current_explanations')
    if not os.path.isdir(explanation_directory):
        os.makedirs(explanation_directory)

    explainer = lime_image.LimeImageExplainer()
    for idxExpl in range(len(transformed_images)):
        break
        explanation = explainer.explain_instance(transformed_images[idxExpl], model.predict_images,
                                                 top_labels=5, hide_color=0, num_samples=1000)

        for pred in dataset.top_predictions[file_list[idxExpl]]:
            temp, mask = explanation.get_image_and_mask(pred['class'], positive_only=False,
                                                        num_features=50, hide_rest=False)

            plt.imsave(os.path.join(explanation_directory, 'lime_' + str(pred['class']) + '_' + file_list[idxExpl]),
                       mark_boundaries(temp / 2 + 0.5, mask))

