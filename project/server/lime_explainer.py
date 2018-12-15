import time
import os
import matplotlib.pyplot as plt
from skimage.segmentation import mark_boundaries, find_boundaries
from lime import lime_image

def create_explanation_images(dataset, model):

    file_list = []
    for file in dataset.file_list:
        file_list.append(file['src'].split('/')[-1])
    transformed_images = model.transform_images([os.path.join(dataset.dataset_path, file) for file in file_list])

    top_preds = {}
    # I'm dividing by 2 and adding 0.5 because of how this Inception represents images
    preds = model.predict_images(transformed_images)
    for idxPred in range(len(preds)):
        top_5_labels = []
        for x in preds.argsort()[idxPred][-5:]:
            top_5_labels.append((x, preds[idxPred, x]))
        top_preds[file_list[idxPred]] = top_5_labels

    for idxExpl in range(len(transformed_images)):
        explainer = lime_image.LimeImageExplainer()
        top_index = preds.argsort()[idxExpl][-1]
        print(top_index, dataset.id_to_label[top_index], preds[idxExpl, top_index])
        explanation = explainer.explain_instance(transformed_images[idxExpl], model.predict_images,
                                                 top_labels=3, hide_color=0, num_samples=10)

        temp, mask = explanation.get_image_and_mask(top_index, positive_only=False, num_features=10, hide_rest=False)
        #print(find_boundaries(mask))

        #plt.imshow(mark_boundaries(temp / 2 + 0.5, mask))
        plt.imshow(mask)
        plt.show()

        break
