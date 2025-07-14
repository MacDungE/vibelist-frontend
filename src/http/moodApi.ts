import axios from 'axios';

import type {MoodChangeOption} from "@/types/common.ts";

export const postMoodChange = (option: MoodChangeOption) =>
  axios.post('/api/mood', { option }); 