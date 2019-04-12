import os
import pickle

'''
    tcav_explainer.py
    Loads an existing tcav result dict. Requires already computed tcav scores.
    TCAV computation found as standalone program in 'tcav_gpu_server' directory.
'''


def load_tcavs(model, dataset, tcav_file_name=None):
    '''
    Locates tcav result dict at the default file location and with default file naming convention.
    :param model: The model the tcav scores have been computed with
    :param dataset: The dataset the tcav scores have been computed for
    :return: a dictionary containing tcav scores for given concepts
    '''
    tcav_scores = {}
    if tcav_file_name == None:
        tcav_file_location = os.path.join(model.model_path, dataset.dataset_name + model.model_name
                                          + '-tcavscores' + '.pkl')
    else:
        tcav_file_location = os.path.join(model.model_path, tcav_file_name)
    print(tcav_file_name)
    if os.path.isfile(tcav_file_location):
        with open(tcav_file_location, 'rb') as f:
            tcav_scores = pickle.load(f)

    return tcav_scores
