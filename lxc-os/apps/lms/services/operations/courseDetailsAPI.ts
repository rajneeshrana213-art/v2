import { toast } from 'react-hot-toast';

import { apiConnector } from '../../lib/api/api-connector';
import { courseEndpoints } from '../../lib/api/apis';

const { GET_ALL_INSTRUCTOR_COURSES_API, DELETE_COURSE_API, GET_FULL_COURSE_DETAILS_AUTHENTICATED } =
  courseEndpoints;

export async function fetchInstructorCourses(token: string) {
  const toastId = toast.loading('Loading...');
  try {
    const response = await apiConnector<any>('GET', GET_ALL_INSTRUCTOR_COURSES_API, null, {
      Authorization: `Bearer ${token}`,
    });

    if (!response?.data?.success) {
      throw new Error(response?.data?.message || 'Could Not Fetch Instructor Courses');
    }

    return response.data.data ?? [];
  } catch (error: any) {
    // eslint-disable-next-line no-console
    console.log('INSTRUCTOR COURSES API ERROR............', error);
    toast.error(error?.message || 'Could Not Fetch Instructor Courses');
    return [];
  } finally {
    toast.dismiss(toastId);
  }
}

export async function deleteCourse(data: { courseId: string }, token: string) {
  const toastId = toast.loading('Loading...');
  try {
    const response = await apiConnector<any>('DELETE', DELETE_COURSE_API, data, {
      Authorization: `Bearer ${token}`,
    });

    if (!response?.data?.success) {
      throw new Error(response?.data?.message || 'Could Not Delete Course');
    }

    toast.success('Course Deleted');
    return true;
  } catch (error: any) {
    // eslint-disable-next-line no-console
    console.log('DELETE COURSE API ERROR............', error);
    toast.error(error?.message || 'Could Not Delete Course');
    return false;
  } finally {
    toast.dismiss(toastId);
  }
}

export async function getFullDetailsOfCourse(courseId: string, token: string) {
  const toastId = toast.loading('Loading...');
  try {
    const response = await apiConnector<any>(
      'POST',
      GET_FULL_COURSE_DETAILS_AUTHENTICATED,
      { courseId },
      { Authorization: `Bearer ${token}` },
    );

    if (!response?.data?.success) {
      throw new Error(response?.data?.message || 'Could not fetch course details');
    }

    return response.data.data ?? null;
  } catch (error: any) {
    // eslint-disable-next-line no-console
    console.log('COURSE_FULL_DETAILS_API API ERROR............', error);
    return null;
  } finally {
    toast.dismiss(toastId);
  }
}

