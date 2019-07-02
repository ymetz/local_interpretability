from scipy import stats
import pickle

import numpy
#numpy.random.seed(267458)

with open('/Users/yannick/Documents/Studium/interVis/models/tensorflow_inception_v3/imagenetinception-tcavscores.pkl', 'rb') as f:
    tcav_2 = pickle.load(f)
    print(tcav_2.keys())

for target in tcav_2:
    total_loss = 0.0
    for concept in [e for e in tcav_2[target] if e['bottleneck'] == 'Mixed_5d']:
        if 'p_val' in concept:
            concept['estimated_p_val'] = True
        else:
            rvs1 = stats.norm.rvs(loc=concept['score'], scale=concept['std'], size=20)
            rvs2 = stats.norm.rvs(loc=concept['random_score'], scale=concept['std'], size=20)
            p_val_sum = 0.0
            for t in range(15):
                numpy.random.seed(t)
                _, p_val = stats.ttest_ind(rvs1, rvs2)
                p_val_sum += p_val
            p_val_mean = p_val_sum / 15
            concept['p_val'] = p_val_mean
            concept['estimated_p_val'] = True
    #print("class:", target, " total_loss:", total_loss, " average loss:", total_loss/len(tcav_2[target]))


with open('/Users/yannick/Documents/Studium/interVis/models/tensorflow_inception_v3/imagenetinception-tcavscores.pkl', 'wb') as f:
    pickle.dump(tcav_2, f)
