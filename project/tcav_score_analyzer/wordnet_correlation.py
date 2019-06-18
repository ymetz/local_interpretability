import nltk
import requests
import itertools
import numpy as np
import random
from nltk.corpus import wordnet as wn
import matplotlib.pyplot as plt
#from nltk.corpus import wordnet_ic
import scipy.spatial.distance as ssd
#brown_ic = wordnet_ic.ic('ic-brown.dat')

from project.server.explanations.tcav_explainer import load_tcavs


def run_experiment():

    d = {}
    with open("/Users/yannick/Documents/Studium/interVis/project/tcav_score_analyzer/synsets.txt") as f:
        for i, line in enumerate(f):
           d[i] = line

    tcav_dict = load_tcavs(None, None, tcav_file_name="/Users/yannick/Documents/Studium/interVis/models/"
                                                      "tensorflow_inception_v3/imagenetinception-tcavscores.pkl",
                           absolute_path=True)

    synsets = {}
    similarities = {}
    for key in tcav_dict:
        synsets[key] = wn._synset_from_pos_and_offset('n', int(d[int(key)][1:]))

    concepts = []
    for concept in [result['concept'] for result in list(tcav_dict.values())[0] if result['bottleneck'] == 'Mixed_7c']:
        concepts.append(concept)

    wordnet_similarities = np.zeros(len([e for e in itertools.combinations(tcav_dict.keys(), r=2)]))
    distances = np.zeros(shape=(len([e for e in itertools.combinations(tcav_dict.keys(), r=2)]), len(concepts)))
    nr_of_pairs = 0

    concept_pairs = {}
    concept_pair_list = []
    for (c1,c2) in itertools.combinations(tcav_dict.keys(), r=2):
        concept_pairs[(c1,c2)] = synsets[c1].lch_similarity(synsets[c2]) / synsets[c1].lch_similarity(synsets[c1])

    sorted_dict = [k for k in sorted(concept_pairs, key=concept_pairs.get, reverse=True)]
    print("# of concept pairs:", len(sorted_dict))
    concept_pair_list += sorted_dict[:25] + random.sample(sorted_dict[25:-25], 40) #+ sorted_dict[-10:]



    for (c1, c2) in concept_pair_list:
        wordnet_similarities[nr_of_pairs] = synsets[c1].lch_similarity(synsets[c2]) / synsets[c1].lch_similarity(synsets[c1])
        # print([result['score'] for result in tcav_dict[c1] if result['bottleneck'] == 'Mixed_7c'])
        # print([result['score'] for result in tcav_dict[c2] if result['bottleneck'] == 'Mixed_7c'])
        # shift input by one (as negative values can occur), then normalize  with X_max = 2, X_min = 0
        class1 = np.zeros(len(concepts))
        class2 = np.zeros(len(concepts))
        for idx, concept in enumerate(concepts):
            class1[idx] = [result['score']
                                 for result in tcav_dict[c1] if result['concept'] == concept and result['bottleneck'] == 'Mixed_7c'][0]
            class2[idx] = [result['score']
                                 for result in tcav_dict[c2] if result['concept'] == concept and result['bottleneck'] == 'Mixed_7c'][0]
        distances[nr_of_pairs, :] = 1.0 - abs(class1 - class2)
        nr_of_pairs += 1


    fig1, ax1 = plt.subplots(1)
    # ax1.set_title('Distances between concept scores/wordnet similarity')
    # ax1.set_ylabel('Wordnet Similarity')
    # ax1.set_xlabel('Concept Score Distance')
    # plt.scatter(distances[:, -1], wordnet_similarities)
    # plt.show()

    # print(distances)

    corrs = np.zeros(len(concepts))
    for idx, concept in enumerate(concepts):
        corrs[idx] = np.corrcoef(distances[:, idx], wordnet_similarities)[1, 0]


    concepts = np.array(concepts)[corrs.argsort()]
    corrs = corrs[corrs.argsort()]

    result_dict = {}
    for pair in zip(concepts, corrs):
        result_dict[pair[0]] = pair[1]
        print(pair[0], ": concept correlation: ", pair[1])

    return {"exp_info": {"name": "wordnet correlation scores", "description": "Determine the correlation between\
     wordnet similarity scores and tcav score similarity", "nr_of_return_elements": 1}, "exp_result": result_dict}

    # ind = np.arange(1, len(concepts)+1)
    # print("average significance", np.average(corrs))
    # fig1, ax1 = plt.subplots(1)
    # ax1.set_title('Correlations between TCAV scores/Wordnet Similarity')
    # ax1.set_ylabel('Correlations')
    # ax1.set_xlabel('Concepts')
    # ax1.set_xticklabels(concepts)
    # plt.bar(ind, corrs, width=0.4)
    # plt.show()





    #cat = wn.synset('cat.n.01')
    #table = wn.synset('table.n.01')

    # word1 = dog1.name().split('.')[0]
    # word2 = dog2.name().split('.')[0]
    # word3 = dog3.name().split('.')[0]
    # word4 = table.name().split('.')[0]
    # word5 = cat.name().split('.')[0]
    #obj = requests.get('http://api.conceptnet.io/relatedness?node1=/c/en/'+word1+'&node2=/c/en/'+word4).json()
    #print(obj)
    #obj = requests.get('http://api.conceptnet.io/relatedness?node1=/c/en/'+word5+'&node2=/c/en/'+word4).json()
    #print(obj)
    #obj = requests.get('http://api.conceptnet.io/relatedness?node1=/c/en/'+word1+'&node2=/c/en/'+word5).json()
    #print(obj)


    #print(dog1.lch_similarity(dog1))
    #print(cat.lch_similarity(cat))
    #print(kimono.lch_similarity(kimono))
    #print(dog1.lch_similarity(dog2))
    #print(dog1.lch_similarity(cat))
    #print(cat.lch_similarity(kimono))
    #print(dog1.lch_similarity(kimono))

    #print(dog1.jcn_similarity(dog1, brown_ic))
    #print(dog1.jcn_similarity(table, brown_ic))
    #print(cat.jcn_similarity(table, brown_ic))
    #print(dog1.jcn_similarity(table, brown_ic))