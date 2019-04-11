import pickle
import os


def create_top_5_predictions(dataset, model):
    file_list = []
    for file in dataset.file_list:
        file_list.append(file['src'].split('/')[-1])
    transformed_images = model.transform_images([os.path.join(dataset.dataset_path, file) for file in file_list])

    top_pred_file_name = os.path.join(dataset.dataset_path, dataset.dataset_name+model.model_name+'-top_preds'+'.pkl')
    if os.path.isfile(top_pred_file_name):
        with open(top_pred_file_name, 'rb') as f:
            setattr(dataset, 'top_predictions', pickle.load(f))
    else:
        top_preds = {}
        # I'm dividing by 2 and adding 0.5 because of how this Inception represents images
        preds = model.predict_images(transformed_images)
        for idxPred in range(len(preds)):
            top_5_labels = []
            for x in preds.argsort()[idxPred][-5:]:
                # we have to subtract one from the predicted class as prediction 0 corresponds to unknown/background
                # class which does not correspond to the ground truth labels
                top_5_labels.append({'class': int(x)-1, 'score': float(preds[idxPred, x])})
            top_preds[file_list[idxPred]] = top_5_labels
            setattr(dataset, 'top_predictions', top_preds)
        with open(top_pred_file_name, 'wb') as f:
            pickle.dump(top_preds, f, pickle.HIGHEST_PROTOCOL)
