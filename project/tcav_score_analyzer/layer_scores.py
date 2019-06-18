import itertools
import numpy as np
import matplotlib.pyplot as plt

from project.server.explanations.tcav_explainer import load_tcavs

tcav_dict = load_tcavs(None, None, tcav_file_name="/Users/yannick/Documents/Studium/interVis/models/"
                                                      "tensorflow_inception_v3/imagenetinception-tcavscores.pkl",
                           absolute_path=True)

print(tcav_dict.keys())


def run_experiment():
    tcav_dict = load_tcavs(None, None, tcav_file_name="/Users/yannick/Documents/Studium/interVis/models/"
                                                      "tensorflow_inception_v3/imagenetinception-tcavscores.pkl",
                           absolute_path=True)

    concepts = []
    for score in list(tcav_dict.values())[0]:
        concept = score['concept']
        if concept not in concepts:
            concepts.append(concept)


    layer5ds = np.zeros(shape=(len(tcav_dict.keys()), len(concepts)))
    layer7cs = np.zeros(shape=(len(tcav_dict.keys()), len(concepts)))
    i = 0
    for c1 in tcav_dict.keys():
        layer5d = np.zeros(len(concepts))
        layer7c = np.zeros(len(concepts))
        for idx, concept in enumerate(concepts):
            layer5d[idx] = [result['score']
                            for result in tcav_dict[c1]
                            if result['concept'] == concept and result['bottleneck'] == 'Mixed_5d'][0]
            layer7c[idx] = [result['score']
                            for result in tcav_dict[c1]
                            if result['concept'] == concept and result['bottleneck'] == 'Mixed_7c'][0]
        layer5ds[i, :] = layer5d
        layer7cs[i, :] = layer7c

        i += 1

    #layer5ds = layer5ds[:, np.median(layer5ds, axis=0).argsort()]
    #layer7cs = layer7cs[:, np.median(layer7cs, axis=0).argsort()]
    #concepts = list(np.asarray(concepts)[sort_order])

    avg_distances = np.zeros(len(concepts))
    #for idx, concept in enumerate(concepts):
    #    avg_distances[idx] = np.average(layer5ds[:, idx])
    #    print(concept, ": concept correlation: ", avg_distances[idx])

    result_dict = {}
    result_dict['total_dist'] = {}
    for concept in concepts:
        sum_dist, sum_n = 0.0, 0
        result_dict[concept] = {}
        for class_id in tcav_dict:
            tcav_class = tcav_dict[class_id]
            class_dist_sum = []
            for score in [tc for tc in tcav_class if concept == tc['concept']]:
                score['class'] = class_id
                if class_id not in result_dict[concept]:
                    result_dict[concept][class_id] = []
                result_dict[concept][class_id].append(score)
                class_dist_sum.append(score['score'])
            sum_dist += max(class_dist_sum) - min(class_dist_sum)
            sum_n += 1
        result_dict['total_dist'][concept] = sum_dist / sum_n

    print(result_dict)

    return {"exp_info": {"name": "layer scores", "description": "Evaluate the influence of the choice of bottleneck\
     layer for tcav scores. Returns", "nr_of_return_elements": 1}, "exp_result": result_dict}

'''
fig1, (ax1,ax2) = plt.subplots(2)
ax1.set_title('TCAV concept scores at layer 5d')
ax1.set_ylabel('concept scores')
ax1.set_xlabel('concepts')
ax1.boxplot(layer5ds[:,:10])
locs, labels = plt.xticks()
plt.xticks(locs, concepts[:10])

ax2.set_title('TCAV concept scores at layer 7c')
ax2.set_ylabel('concept scores')
ax2.set_xlabel('concepts')
ax2.boxplot(layer7cs[:,:10])
locs, labels = plt.xticks()
plt.xticks(locs, concepts[:10])


plt.show()
'''
