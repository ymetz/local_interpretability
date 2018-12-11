import time
import os
import matplotlib.pyplot as plt
from skimage.segmentation import mark_boundaries
from lime import lime_image

def create_explanation_images(dataset, model):

    file_list = []
    for file in dataset.file_list:
        file_list.append(os.path.join(dataset.dataset_path, file['src'].split('/')[-1]))
    transformed_images = model.transform_images(file_list)

    # I'm dividing by 2 and adding 0.5 because of how this Inception represents images
    preds = model.predict_images(transformed_images)
    for idxPred in range(len(preds)):
        print(file_list[idxPred])
        for x in preds.argsort()[idxPred][-5:]:
            print(x, dataset.id_to_label[x], preds[idxPred, x])

    for idxExpl in range(len(transformed_images)):
        explainer = lime_image.LimeImageExplainer()
        top_index = preds.argsort()[idxExpl][-1]
        print(top_index, dataset.id_to_label[top_index], preds[idxExpl, top_index])
        explanation = explainer.explain_instance(transformed_images[idxExpl], model.predict_images,
                                                 top_labels=5, hide_color=0, num_samples=1000)

        temp, mask = explanation.get_image_and_mask(top_index, positive_only=False, num_features=10, hide_rest=False)

        plt.imshow(mark_boundaries(temp / 2 + 0.5, mask))
        plt.show()

        break
