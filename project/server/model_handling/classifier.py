import pickle
import os

'''
    classifier.py
    Contains functions for the actual classification of samples from the dataset as well as classifier performance
    evaluation.
    Calls the current model and dataset and creates a prediction for each element in the dataset.
'''


def create_top_5_predictions(dataset, model):
    '''
    Calls the current model and dataset and creates a prediction for each element in the dataset.
    Saves the classification results to a pickle file. If the predictions were already made for the current dataset
    and model, just load the content of the pickle file.
    :param dataset: currently active dataset object
    :param model: currently active model object
    :return: a dictionary containing the top 5 predicted classes, contains class label and classfier confidence score
    '''

    out_preds = None

    top_pred_file_name = os.path.join(dataset.dataset_path,
                                      dataset.dataset_name + model.model_name + '-top_preds' + '.pkl')
    if os.path.isfile(top_pred_file_name):
        with open(top_pred_file_name, 'rb') as f:
            out_preds = pickle.load(f)

    else:
        i = 0
        top_preds = {}
        for batch in chunks(dataset.file_list[:5000], 200):
            print("Batch #{0}".format(i))
            file_list = []
            for file in batch:
                file_list.append(file['src'].split('/')[-1])
            transformed_images = model.transform_images(
                [os.path.join(dataset.dataset_path, file) for file in file_list])

            preds = model.predict_images(transformed_images)
            # Make sure the predictions are sorted from lowest to highest score in top_predictions!!
            for idxPred in range(len(preds)):
                top_5_labels = []
                for x in preds.argsort()[idxPred][-5:]:
                    # if the model logits are shifted compared to the groundtruth labels, add shift here
                    top_5_labels.append({'class': int(x) - model.logit_shift, 'score': float(preds[idxPred, x])})
                top_preds[file_list[idxPred]] = top_5_labels
            i += 1
        out_preds = top_preds
        with open(top_pred_file_name, 'wb') as f:
            pickle.dump(top_preds, f, pickle.HIGHEST_PROTOCOL)

    return out_preds


def check_classifier_performance(dataset, model_predictions):
    '''
    Evaluates the performance of the classifier by comparing the results with the ground truth labels.
    :param dataset: dataset we previously created the predictions for. Contains the element labels for comparison
    :param model_predictions: the previously created predictions as returned by create_top_5_predictions()
    :return: A list of dicts for each class with the number of total predictions (n) and correct predictions
             (top_predicted or top5_predicted),
             A dict object that contains the classifier performance for all elements in the dataset
    '''
    class_performances = []
    overall_performance = {'top_predicted': 0, 'top5_predicted': 0, 'n': 0}

    for predictions in model_predictions.items():
        # get the classes of all the predicted classes
        predicted_classes = [pred['class'] for pred in predictions[1]]
        # get the prediction with the highest score
        top_prediction = predictions[1][-1]['class']
        # predictions 0 is the name of the image
        label = dataset.labels[predictions[0]][0]

        class_performance = None
        for cp in class_performances:
            if cp['class'] == label:
                class_performance = cp
        if class_performance is None:
            class_performance = {'class': label, 'top_predicted': 0, 'top5_predicted': 0, 'n': 0}
            class_performances.append(class_performance)

        if top_prediction == label:
            class_performance['top_predicted'] += 1
            overall_performance['top_predicted'] += 1
        elif label in predicted_classes:
            class_performance['top5_predicted'] += 1
            overall_performance['top5_predicted'] += 1

        class_performance['n'] += 1
        overall_performance['n'] += 1

    return {'class_performances': class_performances, 'overall_performance': overall_performance}


def chunks(l, n):
    '''
    Generator function to separate a list into batches/chunks.
    :param l: the list to be split into chunks
    :param n: the chunk size
    :return: everytime the generator is called, returns an approriate chunk of the list
    '''
    # For item i in a range that is a length of l,
    for i in range(0, len(l), n):
        # Create an index range for l of n items:
        yield l[i:i + n]
