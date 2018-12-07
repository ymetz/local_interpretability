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
    #preds = model.predict_images(transformed_images)
    preds = []
    for i in range(len(preds)):
        print(file_list[i])
        for x in preds.argsort()[i][-5:]:
            print(x, dataset.id_to_labels[str(x)], preds[i, x])

    image = transformed_images[0]

    explainer = lime_image.LimeImageExplainer()
    predi = model.predict_images([image])
    top_index = predi.argsort()[0][-1]
    print(top_index, dataset.id_to_labels[str(top_index)], predi[0, top_index])
    explanation = explainer.explain_instance(image, model.predict_images, top_labels=5, hide_color=0, num_samples=1000)

    temp, mask = explanation.get_image_and_mask(top_index, positive_only=False, num_features=10, hide_rest=False)
    plt.imshow(mark_boundaries(temp / 2 + 0.5, mask))

    plt.show()
