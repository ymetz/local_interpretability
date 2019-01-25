from deepexplain.tensorflow import DeepExplain
from matplotlib import pyplot as plt
from skimage import feature, transform
import tensorflow as tf
from operator import itemgetter

import os
from tensorflow_models import InceptionModel
import numpy as np

def create_lrp_explanation(dataset,filename,class_id):

    tf.reset_default_graph()
    lrp_session = tf.Session()

    with DeepExplain(session=lrp_session, graph=lrp_session.graph) as de:
        theModel = InceptionModel(0, "", "", session=lrp_session, graph=lrp_session.graph, mode='lrp')

        #file_list = []
        #for file in dataset.file_list:
        #    file_list.append(file['src'].split('/')[-1])
        file = filename
        transformed_image = theModel.transform_images([os.path.join(dataset.dataset_path, file)])

    #hot_one_label = dataset.top_predictions[file][-1]['class']
    hot_one_label = class_id

    with DeepExplain(session=lrp_session) as de:
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
        attribution = de.explain('elrp', tf.one_hot(hot_one_label, dataset.num_of_labels)*theModel.logits,
                                 theModel.processed_images, transformed_image)

    explanation_directory = os.path.join(dataset.dataset_path, 'current_explanations')
    if not os.path.isdir(explanation_directory):
        os.makedirs(explanation_directory)

    xi = (transformed_image - np.min(transformed_image))
    xi /= np.max(xi)

    print(attribution.shape)
    for attr in attribution:
        save_as_img(os.path.join(explanation_directory, 'elrp' + '_' + str(class_id) + '_' + filename),
                   attr, xi=xi, dilation=.5, percentile=99, alpha=.2)


def save_as_img(image_path, data, xi=None, cmap='RdBu_r', percentile=100, dilation=3.0, alpha=0.8):
    dx, dy = 0.05, 0.05
    xx = np.arange(0.0, data.shape[1], dx)
    yy = np.arange(0.0, data.shape[0], dy)
    xmin, xmax, ymin, ymax = np.amin(xx), np.amax(xx), np.amin(yy), np.amax(yy)
    extent = xmin, xmax, ymin, ymax
    cmap_xi = plt.get_cmap('Greys_r')
    cmap_xi.set_bad(alpha=0)
    overlay = None
    if xi is not None:
        # Compute edges (to overlay to heatmaps later)
        xi_greyscale = xi if len(xi.shape) == 2 else np.squeeze(np.mean(xi, axis=-1),axis=0)
        in_image_upscaled = transform.rescale(xi_greyscale, dilation, mode='constant', multichannel=False,
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
    plt.savefig(image_path, bbox_inches='tight')

'''
    n_cols = int(len(attributions)) + 1
    n_rows = len(transformed_images)
    fig, axes = plt.subplots(nrows=n_rows, ncols=n_cols, figsize=(3 * n_cols, 3 * n_rows))

    for i, xi in enumerate(transformed_images):
        xi = (xi - np.min(xi))
        xi /= np.max(xi)
        ax = axes.flatten()[i * n_cols]
        ax.imshow(xi)
        ax.set_title('Original')
        ax.axis('off')
        for j, a in enumerate(attributions):
            axj = axes.flatten()[i * n_cols + j + 1]
            plot(attributions[a][i], xi=xi, axis=axj, dilation=.5, percentile=99, alpha=.2)
    plt.show()


def plot(data, xi=None, cmap='RdBu_r', axis=plt, percentile=100, dilation=3.0, alpha=0.8):
    dx, dy = 0.05, 0.05
    xx = np.arange(0.0, data.shape[1], dx)
    yy = np.arange(0.0, data.shape[0], dy)
    xmin, xmax, ymin, ymax = np.amin(xx), np.amax(xx), np.amin(yy), np.amax(yy)
    extent = xmin, xmax, ymin, ymax
    cmap_xi = plt.get_cmap('Greys_r')
    cmap_xi.set_bad(alpha=0)
    overlay = None
    if xi is not None:
        # Compute edges (to overlay to heatmaps later)
        xi_greyscale = xi if len(xi.shape) == 2 else np.mean(xi, axis=-1)
        in_image_upscaled = transform.rescale(xi_greyscale, dilation, mode='constant')
        edges = feature.canny(in_image_upscaled).astype(float)
        edges[edges < 0.5] = np.nan
        edges[:5, :] = np.nan
        edges[-5:, :] = np.nan
        edges[:, :5] = np.nan
        edges[:, -5:] = np.nan
        overlay = edges

    abs_max = np.percentile(np.abs(data), percentile)
    abs_min = abs_max

    if len(data.shape) == 3:
        data = np.mean(data, 2)
    axis.imshow(data, extent=extent, interpolation='none', cmap=cmap, vmin=-abs_min, vmax=abs_max)
    if overlay is not None:
        axis.imshow(overlay, extent=extent, interpolation='none', cmap=cmap_xi, alpha=alpha)
    axis.axis('off')
    return axis
'''