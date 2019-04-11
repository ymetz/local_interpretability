from deepexplain.tensorflow import DeepExplain
from matplotlib import pyplot as plt
from skimage import feature, transform
import tensorflow as tf

import os
from model_handling.tensorflow_models import InceptionModel
import numpy as np

'''
    lrp_explainer.py
'''

def initialize_lrp_model():
    '''

    :return:
    '''
    lrp_session = tf.Session()
    with DeepExplain(session=lrp_session, graph=lrp_session.graph) as de:
            the_model = InceptionModel(0, "", "", session=lrp_session, graph=lrp_session.graph, mode='lrp')

    return the_model, lrp_session


def create_lrp_explanation(dataset, filenames, lrp_session, the_model, top_preds):
    '''

    :param dataset:
    :param filenames:
    :param lrp_session:
    :param the_model:
    :param top_preds:
    :return:
    '''
    explanation_directory = os.path.join(dataset.dataset_path, 'current_explanations')
    if not os.path.isdir(explanation_directory):
        os.makedirs(explanation_directory)

    with DeepExplain(session=lrp_session) as de:
        for file in filenames:
            file_name = file['src'].split('/')[-1]
            transformed_image = the_model.transform_images([os.path.join(dataset.dataset_path, file_name)])

            for pred in top_preds[file_name]:
                class_id = pred['class']
                # if logits are shifted compared to labels, hot_one_label is different
                hot_one_label = class_id + the_model.logit_shift

                attribution = de.explain('elrp', tf.one_hot(hot_one_label, dataset.num_of_labels)*the_model.logits,
                                         the_model.processed_images, transformed_image)

                xi = (transformed_image - np.min(transformed_image))
                xi /= np.max(xi)

                for attr in attribution:
                    save_as_img(os.path.join(explanation_directory, 'elrp' + '_' + str(class_id) + '_' + file_name),
                               attr, xi=xi, dilation=0.5, percentile=99, alpha=0.5)


def save_as_img(image_path, data, xi=None, cmap='RdBu_r', percentile=100, dilation=3.0, alpha=0.8):
    plt.axis('off')
    dx, dy = 0.05, 0.05
    xx = np.arange(0.0, data.shape[1], dx)
    yy = np.arange(0.0, data.shape[0], dy)
    xmin, xmax, ymin, ymax = np.amin(xx), np.amax(xx), np.amin(yy), np.amax(yy)
    extent = xmin, xmax, ymin, ymax
    cmap_xi = plt.get_cmap('Greys')
    cmap_xi.set_bad(alpha=0)
    overlay = None
    if xi is not None:
        # Compute edges (to overlay to heatmaps later)
        xi_greyscale = xi if len(xi.shape) == 2 else np.squeeze(np.mean(xi, axis=-1), axis=0)
        in_image_upscaled = transform.rescale(xi_greyscale, dilation, mode='constant', multichannel=True,
                                              anti_aliasing=True)
        edges = feature.canny(in_image_upscaled).astype(float)
        edges[edges < 0.5] = np.nan
        edges[:5, :] = np.nan
        edges[-5:, :] = np.nan
        edges[:, :5] = np.nan
        edges[:, -5:] = np.nan
        overlay = edges

    abs_max = np.percentile(np.abs(data), percentile)
    abs_min = abs_max
    plt.axis('off')

    if len(data.shape) == 3:
        data = np.mean(data, 2)
    plt.imshow(data, extent=extent, interpolation='none', cmap=cmap, vmin=-abs_min, vmax=abs_max)
    if overlay is not None:
        plt.imshow(overlay, extent=extent, interpolation='none', cmap=cmap_xi, alpha=alpha)
    plt.savefig(image_path, bbox_inches='tight', transparent=True, pad_inches=0.0)

'''
attributions = {
    # Gradient-based
    # NOTE: reduce_max is used to select the output unit for the class predicted by the classifier
    # For an example of how to use the ground-truth labels instead, see mnist_cnn_keras notebook
    #'Saliency maps': de.explain('saliency', tf.reduce_max(theModel.logits, 1), theModel.processed_images, transformed_images),
    #'Gradient * Input': de.explain('grad*input', tf.reduce_max(theModel.logits, 1), theModel.processed_images, transformed_images),
    #'Integrated Gradients': de.explain('intgrad', tf.reduce_max(theModel.logits, 1), theModel.processed_images, transformed_images),
    #'Epsilon-LRP with best pred': de.explain('elrp', tf.reduce_max(theModel.logits, 1), theModel.processed_images, transformed_images),
    'Epsilon-LRP with target': de.explain('elrp',
                                          tf.one_hot(hot_one_label, dataset.num_of_labels)*theModel.logits,
                                          theModel.processed_images, transformed_image),
    #'DeepLIFT (Rescale)': de.explain('deeplift', tf.reduce_max(theModel.logits, 1), theModel.processed_images, transformed_images)
}
'''